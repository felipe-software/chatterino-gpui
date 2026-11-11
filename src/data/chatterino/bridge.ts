import type { ChatCore, Settings } from "../api";
import { sanitizeSettings } from "../persistence";
import type { Timers } from "../irc/connection";
import {
    accountsFromChatterino,
    layoutFromChatterino,
    settingsFromChatterino,
    uiPrefsFromChatterino,
    type ChatterinoUiPrefs,
    type ImportedWindow,
} from "./convert";

export type KnownDirectories = { home: string | null; data: string | null; config: string | null };

export type ChatterinoFiles = {
    readText(path: string): Promise<string | null>;
    knownDirectories(): Promise<KnownDirectories>;
};

export type ChatterinoInstance = { root: string; settingsPath: string; layoutPath: string };

export type ImportSummary = { settings: number; accounts: number; tabs: number };

export type ChatterinoUiUpdate = { prefs: ChatterinoUiPrefs; mutedTabIds?: string[]; window?: ImportedWindow };

export type ChatterinoBridge = {
    find(): Promise<ChatterinoInstance | undefined>;
    importAll(instance: ChatterinoInstance): Promise<ImportSummary>;
    onUiUpdate(listener: (update: ChatterinoUiUpdate) => void): () => void;
    dispose(): void;
};

export const SYNC_INTERVAL_MS = 15_000;

export function chatterinoRoots(dirs: KnownDirectories, platform: string): string[] {
    const roots: string[] = [];
    if (dirs.data) roots.push(`${dirs.data}/chatterino`);
    if (platform === "linux" && dirs.home) roots.push(`${dirs.home}/.var/app/com.chatterino.chatterino/data/chatterino`);
    return roots;
}

function parse(textValue: string | null): unknown {
    if (textValue === null) return undefined;
    try {
        return JSON.parse(textValue);
    } catch {
        return undefined;
    }
}

async function readSafely(files: ChatterinoFiles, path: string): Promise<string | null> {
    try {
        return await files.readText(path);
    } catch (error) {
        console.warn(`cannot read ${path}`, error);
        return null;
    }
}

export function applySettingsPatch(current: Settings, patch: Partial<Settings>): Settings {
    return sanitizeSettings({ ...current, ...patch });
}

type Options = {
    core: Pick<ChatCore, "settings" | "layout" | "accounts" | "addAccountWithCredentials">;
    files: ChatterinoFiles | undefined;
    platform: string;
    timers: Pick<Timers, "setTimeout" | "clearTimeout">;
};

export function createChatterinoBridge({ core, files, platform, timers }: Options): ChatterinoBridge {
    let instance: Promise<ChatterinoInstance | undefined> | undefined;
    let lastSynced: string | null = null;
    let syncing = false;
    let syncGeneration = 0;
    let poll: unknown;
    let idCounter = 0;
    let lastUiUpdate: ChatterinoUiUpdate | undefined;
    const uiListeners = new Set<(update: ChatterinoUiUpdate) => void>();
    const nextId = (prefix: string) => `${prefix}-chatterino-${Date.now().toString(36)}-${(idCounter += 1)}`;

    async function locate(): Promise<ChatterinoInstance | undefined> {
        if (!files) return undefined;
        let dirs: KnownDirectories;
        try {
            dirs = await files.knownDirectories();
        } catch {
            return undefined;
        }
        for (const root of chatterinoRoots(dirs, platform)) {
            const settingsPath = `${root}/Settings/settings.json`;
            if ((await readSafely(files, settingsPath)) !== null) return { root, settingsPath, layoutPath: `${root}/Settings/window-layout.json` };
        }
        return undefined;
    }

    function find(): Promise<ChatterinoInstance | undefined> {
        instance ??= locate();
        return instance;
    }

    function emitUiUpdate(update: ChatterinoUiUpdate): void {
        lastUiUpdate = update;
        for (const listener of [...uiListeners]) listener(update);
    }

    function onUiUpdate(listener: (update: ChatterinoUiUpdate) => void): () => void {
        uiListeners.add(listener);
        if (lastUiUpdate) listener(lastUiUpdate);
        return () => {
            uiListeners.delete(listener);
        };
    }

    function applySettings(settingsText: string, fromLayout: Omit<ChatterinoUiUpdate, "prefs"> = {}): number {
        const parsed = parse(settingsText);
        const patch = settingsFromChatterino(parsed);
        const prefs = uiPrefsFromChatterino(parsed);
        emitUiUpdate({ prefs, ...fromLayout });
        const current = core.settings.get();
        const next = applySettingsPatch(current, patch);
        if (JSON.stringify(next) !== JSON.stringify(current)) core.settings.set(next);
        return Object.keys(patch).length + Object.keys(prefs).length;
    }

    async function importAll(found: ChatterinoInstance): Promise<ImportSummary> {
        const settingsText = files ? await readSafely(files, found.settingsPath) : null;
        const layoutText = files ? await readSafely(files, found.layoutPath) : null;
        const summary: ImportSummary = { settings: 0, accounts: 0, tabs: 0 };
        const imported = layoutFromChatterino(parse(layoutText), nextId);
        if (imported) {
            core.layout.set(imported.layout);
            summary.tabs = imported.layout.tabs.length;
        }
        if (settingsText !== null) {
            const fromLayout: Omit<ChatterinoUiUpdate, "prefs"> = {};
            if (imported) fromLayout.mutedTabIds = imported.mutedTabIds;
            if (imported?.window) fromLayout.window = imported.window;
            summary.settings = applySettings(settingsText, fromLayout);
            lastSynced = settingsText;
            const accounts = accountsFromChatterino(parse(settingsText));
            const ordered = [...accounts.accounts].sort((a, b) => Number(a.login === accounts.current) - Number(b.login === accounts.current));
            for (const account of ordered) {
                const result = core.addAccountWithCredentials({
                    username: account.login,
                    userId: account.userId,
                    clientId: account.clientId,
                    oauthToken: account.token,
                });
                if (result.ok) summary.accounts += 1;
            }
        }
        return summary;
    }

    async function syncOnce(): Promise<void> {
        const found = await find();
        if (!found || !files || !core.settings.get().syncChatterinoSettings) return;
        const settingsText = await readSafely(files, found.settingsPath);
        if (settingsText === null || settingsText === lastSynced) return;
        lastSynced = settingsText;
        applySettings(settingsText);
    }

    function schedule(generation: number): void {
        poll = timers.setTimeout(() => {
            void syncOnce().finally(() => {
                if (syncing && generation === syncGeneration) schedule(generation);
            });
        }, SYNC_INTERVAL_MS);
    }

    function updateSync(enabled: boolean): void {
        if (enabled && !syncing) {
            syncing = true;
            syncGeneration += 1;
            lastSynced = null;
            void syncOnce();
            schedule(syncGeneration);
        }
        if (!enabled && syncing) {
            syncing = false;
            timers.clearTimeout(poll);
        }
    }

    updateSync(core.settings.get().syncChatterinoSettings);
    const unsubscribe = core.settings.subscribe((value) => updateSync(value.syncChatterinoSettings));

    return {
        find,
        importAll,
        onUiUpdate,
        dispose() {
            unsubscribe();
            updateSync(false);
        },
    };
}
