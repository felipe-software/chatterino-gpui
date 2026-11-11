import { describe, expect, test } from "bun:test";
import type { AccountsState, LoginCredentials, LoginResult, Settings, WindowLayout } from "../api";
import { chatterinoRoots, createChatterinoBridge, type ChatterinoFiles, type ChatterinoUiUpdate } from "../chatterino/bridge";
import { accountsFromChatterino, argbToCss, layoutFromChatterino, settingsFromChatterino, uiPrefsFromChatterino } from "../chatterino/convert";
import { defaultLayout, defaultSettings } from "../defaults";
import { DEFAULT_WINDOW, loadSettings, loadWindowGeometry, memoryStorage, save, sanitizeSettings, STORAGE_KEYS } from "../persistence";
import { createStore } from "../store";
import { manualTimers } from "./helpers";

const SETTINGS = {
    misc: { currentVersion: "2.5.5", lockNotebookLayout: true },
    accounts: {
        uid1: { username: "Alice", userID: "1", clientID: "client-a", oauthToken: "oauth:token-a" },
        uid2: { username: "bob", userID: "2", clientID: "client-b", oauthToken: "token-b" },
        uid3: { username: "broken", userID: "", clientID: "c", oauthToken: "t" },
        current: "alice",
    },
    appearance: {
        theme: { name: "Black", darkSystem: "Dark", lightSystem: "White" },
        thumbnailSize: 300,
        tabDirection: 2,
        tabStyle: "Compact",
        currentFontFamily: "Inter",
        currentFontSize: 14,
        tabVisibility: 1,
        showTabCloseButton: false,
        messages: { hideModerated: true, usernameDisplayMode: 1, separateMessages: true, showMessageLength: true },
    },
    behaviour: { pauseChatModifier: 67108864 },
    highlighting: {
        selfHighlightColor: "#64c466ff",
        highlights: [{ pattern: "forsen", showInMentions: true, alert: false, sound: true, regex: false, case: false, soundUrl: "", color: "#7f7f3f49" }],
        users: [{ pattern: "Pajlada", showInMentions: false, alert: true, sound: false, regex: false, case: false, soundUrl: "", color: "" }],
        badges: [{ name: "vip", displayName: "VIP", showInMentions: true, alert: false, sound: false, soundUrl: "", color: "#ffff0000" }],
        blacklist: [{ pattern: "nightbot", regex: false }],
    },
    moderation: { actions: [{ pattern: "/timeout {user.name} 600", icon: "" }] },
    filtering: { filters: [{ name: "subs", filter: "author.subbed", id: "{f-1}" }] },
    logging: { channels: [{ channelName: "forsen" }] },
    timeouts: { timeoutButtons: [["s", 5], { unit: "m", value: 10 }, ["x", 1]] },
    ignore: { phrases: [{ pattern: "spam", regex: true, isBlock: true, replaceWith: "", caseSensitive: false }] },
    nicknames: [{ name: "pajlada", replace: "pajaSWA", isRegex: false, isCaseSensitive: false }],
    commands: [{ name: "/hi", func: "hello {1}", showInMsgContextMenu: true }],
    pings: { muted: ["forsen"] },
};

const LAYOUT = {
    windows: [
        {
            type: "main",
            x: 40,
            y: 60,
            width: 900,
            height: 640,
            state: "maximized",
            tabs: [
                { selected: false, highlightsEnabled: false, splits2: { type: "split", data: { type: "twitch", name: "Forsen" }, filters: ["{f-1}"], flexh: 1, flexv: 1 } },
                {
                    selected: true,
                    highlightsEnabled: true,
                    title: "Pair",
                    splits2: {
                        type: "horizontal",
                        items: [
                            { type: "split", data: { type: "twitch", name: "xqc" }, flexh: 3, flexv: 1 },
                            {
                                type: "vertical",
                                flexh: 1,
                                items: [
                                    { type: "split", data: { type: "mentions" }, moderationMode: true },
                                    { type: "split", data: { type: "unknown" } },
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    ],
};

function counter() {
    let id = 0;
    return (prefix: string) => `${prefix}-${(id += 1)}`;
}

function fakeFiles(entries: Record<string, string>): ChatterinoFiles & { files: Record<string, string>; reads: string[] } {
    const files = { ...entries };
    const reads: string[] = [];
    return {
        files,
        reads,
        readText: async (path) => {
            reads.push(path);
            return files[path] ?? null;
        },
        knownDirectories: async () => ({ home: "/home/me", data: "/home/me/.local/share", config: "/home/me/.config" }),
    };
}

function fakeCore() {
    const settings = createStore<Settings>(defaultSettings("linux"));
    const layout = createStore<WindowLayout>(defaultLayout());
    const accounts = createStore<AccountsState>({ accounts: [] });
    const added: LoginCredentials[] = [];
    const addAccountWithCredentials = (credentials: LoginCredentials): LoginResult => {
        added.push(credentials);
        return { ok: true, account: { login: credentials.username, userId: credentials.userId, clientId: credentials.clientId, token: credentials.oauthToken, scopes: [] } };
    };
    return { settings, layout, accounts, addAccountWithCredentials, added };
}

const FLATPAK = "/home/me/.var/app/com.chatterino.chatterino/data/chatterino";

async function settle() {
    for (let index = 0; index < 5; index += 1) await Promise.resolve();
}

describe("chatterino conversion", () => {
    test("converts Qt #AARRGGBB colors to CSS #RRGGBBAA", () => {
        expect(argbToCss("#64c466ff")).toBe("#c466ff64");
        expect(argbToCss("#7f2026")).toBe("#7f2026");
        expect(argbToCss("")).toBe("");
    });

    test("maps scalar, enum, theme and list settings", () => {
        const patch = settingsFromChatterino(SETTINGS);
        expect(patch.theme).toBe("black");
        expect(patch.systemTheme).toBe(false);
        expect(patch.darkSystemTheme).toBe("dark");
        expect(patch.lightSystemTheme).toBe("white");
        expect(patch.thumbnailSize).toBe(300);
        expect(patch.tabDirection).toBe("right");
        expect(patch.tabStyle).toBe("compact");
        expect(patch.pauseChatModifier).toBe("control");
        expect(patch.usernameDisplayMode).toBe("username");
        expect(patch.fontFamily).toBe("Inter");
        expect(patch.fontSize).toBe(14);
        expect(patch.showMessageSeparators).toBe(true);
        expect(patch.showDeletedMessages).toBe(false);
        expect(patch.selfHighlightColor).toBe("#c466ff64");
        expect(patch.highlightPhrases).toEqual([
            { pattern: "forsen", isRegex: false, caseSensitive: false, playSound: true, alert: false, showInMentions: true, color: "#7f3f497f" },
        ]);
        expect(patch.highlightUsers?.[0]).toMatchObject({ login: "Pajlada", alert: true, showInMentions: false });
        expect(patch.ignoredPhrases).toEqual([{ pattern: "spam", isRegex: true, caseSensitive: false, isBlock: true, replaceWith: "" }]);
        expect(patch.nicknames).toEqual([{ name: "pajlada", replace: "pajaSWA", isRegex: false, caseSensitive: false }]);
        expect(patch.commands).toEqual([{ trigger: "/hi", command: "hello {1}", showInMessageMenu: true }]);
        expect(patch.mutedChannels).toEqual(["forsen"]);
        expect(patch.highlightBadges).toEqual([{ name: "vip", displayName: "VIP", showInMentions: true, alert: false, playSound: false, color: "#ff0000ff" }]);
        expect(patch.blacklistedUsers).toEqual([{ pattern: "nightbot", isRegex: false }]);
        expect(patch.moderationActions).toEqual([{ action: "/timeout {user.name} 600" }]);
        expect(patch.filters).toEqual([{ id: "{f-1}", name: "subs", filter: "author.subbed" }]);
        expect(patch.loggedChannels).toEqual(["forsen"]);
        expect(patch.timeoutButtons).toEqual([
            { unit: "s", value: 5 },
            { unit: "m", value: 10 },
        ]);
        expect("historyLimit" in patch).toBe(false);
        expect(settingsFromChatterino("nope")).toEqual({});
    });

    test("maps the tab and message settings the app keeps in its UI prefs", () => {
        expect(uiPrefsFromChatterino(SETTINGS)).toEqual({ showMessageLength: true, showTabCloseButton: false, lockTabs: true, tabVisibility: "live" });
        expect(uiPrefsFromChatterino({})).toEqual({});
    });

    test("the system theme name turns on the adaptive theme", () => {
        expect(settingsFromChatterino({ appearance: { theme: { name: "System" } } })).toMatchObject({ systemTheme: true });
    });

    test("sanitizing drops values the app cannot use", () => {
        const merged = sanitizeSettings({ ...defaultSettings("linux"), ...settingsFromChatterino({ appearance: { tabDirection: 9, uiScale2: 99 } }) });
        expect(merged.tabDirection).toBe("top");
        expect(merged.uiScale).toBe(10);
    });

    test("reads complete accounts and the current one", () => {
        const state = accountsFromChatterino(SETTINGS);
        expect(state.accounts.map((account) => account.login)).toEqual(["alice", "bob"]);
        expect(state.accounts[0]).toEqual({ login: "alice", userId: "1", clientId: "client-a", token: "token-a", scopes: [] });
        expect(state.current).toBe("alice");
        expect(accountsFromChatterino({})).toEqual({ accounts: [] });
    });

    test("rebuilds tabs and split trees from window-layout.json", () => {
        const { layout, mutedTabIds } = layoutFromChatterino(LAYOUT, counter())!;
        expect(layout.tabs).toHaveLength(2);
        expect(layout.tabs[0].root).toEqual({ type: "split", id: "split-1", channel: "forsen", filters: ["{f-1}"] });
        expect(mutedTabIds).toEqual([layout.tabs[0].id]);
        expect(layoutFromChatterino(LAYOUT, counter())?.window).toEqual({ x: 40, y: 60, width: 900, height: 640, maximized: true });
        const unplaced = { windows: [{ type: "main", x: -1, y: -1, width: 700, height: 500, tabs: LAYOUT.windows[0].tabs }] };
        expect(layoutFromChatterino(unplaced, counter())?.window).toEqual({ width: 700, height: 500 });
        const pair = layout.tabs[1];
        expect(layout.selectedTabId).toBe(pair.id);
        expect(pair.title).toBe("Pair");
        expect(pair.root).toMatchObject({
            type: "container",
            direction: "horizontal",
            sizes: [0.75, 0.25],
            children: [
                { type: "split", channel: "xqc" },
                { type: "split", channel: "/mentions", moderationMode: true },
            ],
        });
        expect(pair.focusedSplitId).toBe((pair.root as { children: Array<{ id: string }> }).children[0].id);
        expect(layoutFromChatterino({ windows: [] }, counter())).toBeUndefined();
        expect(layoutFromChatterino(undefined, counter())).toBeUndefined();
    });
});

describe("chatterino bridge", () => {
    test("looks in the data dir, then in the Flatpak sandbox", async () => {
        expect(chatterinoRoots({ home: "/home/me", data: "/d", config: "/c" }, "linux")).toEqual(["/d/chatterino", FLATPAK]);
        expect(chatterinoRoots({ home: "/Users/me", data: "/Users/me/Library/Application Support", config: null }, "darwin")).toEqual([
            "/Users/me/Library/Application Support/chatterino",
        ]);
        const files = fakeFiles({ [`${FLATPAK}/Settings/settings.json`]: "{}" });
        const bridge = createChatterinoBridge({ core: fakeCore(), files, platform: "linux", timers: manualTimers() });
        expect(await bridge.find()).toEqual({
            root: FLATPAK,
            settingsPath: `${FLATPAK}/Settings/settings.json`,
            layoutPath: `${FLATPAK}/Settings/window-layout.json`,
        });
        bridge.dispose();
    });

    test("finds nothing without Chatterino or without file access", async () => {
        const timers = manualTimers();
        expect(await createChatterinoBridge({ core: fakeCore(), files: fakeFiles({}), platform: "linux", timers }).find()).toBeUndefined();
        expect(await createChatterinoBridge({ core: fakeCore(), files: undefined, platform: "linux", timers }).find()).toBeUndefined();
    });

    test("imports settings, accounts with the current one last, and the layout", async () => {
        const root = "/home/me/.local/share/chatterino";
        const files = fakeFiles({ [`${root}/Settings/settings.json`]: JSON.stringify(SETTINGS), [`${root}/Settings/window-layout.json`]: JSON.stringify(LAYOUT) });
        const core = fakeCore();
        const bridge = createChatterinoBridge({ core, files, platform: "linux", timers: manualTimers() });
        const updates: ChatterinoUiUpdate[] = [];
        bridge.onUiUpdate((update) => updates.push(update));
        const summary = await bridge.importAll((await bridge.find())!);
        expect(updates).toHaveLength(1);
        expect(updates[0].mutedTabIds).toEqual([core.layout.get().tabs[0].id]);
        expect(updates[0].prefs.lockTabs).toBe(true);
        expect(updates[0].window).toEqual({ x: 40, y: 60, width: 900, height: 640, maximized: true });
        const late: ChatterinoUiUpdate[] = [];
        bridge.onUiUpdate((update) => late.push(update));
        expect(late).toEqual(updates);
        expect(summary.accounts).toBe(2);
        expect(summary.tabs).toBe(2);
        expect(summary.settings).toBeGreaterThan(10);
        expect(core.added.map((credentials) => credentials.username)).toEqual(["bob", "alice"]);
        expect(core.settings.get().theme).toBe("black");
        expect(core.settings.get().uiStyle).toBe("modern");
        expect(core.settings.get().syncChatterinoSettings).toBe(false);
        expect(core.layout.get().tabs.map((tab) => tab.root?.type)).toEqual(["split", "container"]);
        bridge.dispose();
    });

    test("sync applies Chatterino changes while enabled and stops when disabled", async () => {
        const path = "/home/me/.local/share/chatterino/Settings/settings.json";
        const files = fakeFiles({ [path]: JSON.stringify({ appearance: { theme: { name: "Light" } } }) });
        const core = fakeCore();
        const timers = manualTimers();
        const bridge = createChatterinoBridge({ core, files, platform: "linux", timers });
        await settle();
        expect(core.settings.get().theme).toBe("dark");

        core.settings.set((current) => ({ ...current, syncChatterinoSettings: true }));
        await settle();
        expect(core.settings.get().theme).toBe("light");

        core.settings.set((current) => ({ ...current, theme: "white" }));
        timers.advance(15_000);
        await settle();
        expect(core.settings.get().theme).toBe("white");

        files.files[path] = JSON.stringify({ appearance: { theme: { name: "Black" } } });
        timers.advance(15_000);
        await settle();
        expect(core.settings.get().theme).toBe("black");
        expect(core.settings.get().syncChatterinoSettings).toBe(true);

        core.settings.set((current) => ({ ...current, syncChatterinoSettings: false }));
        files.files[path] = JSON.stringify({ appearance: { theme: { name: "Dark" } } });
        timers.advance(60_000);
        await settle();
        expect(core.settings.get().theme).toBe("black");
        expect(timers.pending()).toBe(0);
        bridge.dispose();
    });
});

describe("window geometry", () => {
    test("restores a saved frame and falls back on bad values", () => {
        const storage = memoryStorage();
        expect(loadWindowGeometry(storage)).toEqual(DEFAULT_WINDOW);
        save(storage, STORAGE_KEYS.window, { width: 1000.4, height: 700, x: 12, y: 34, maximized: true });
        expect(loadWindowGeometry(storage)).toEqual({ width: 1000, height: 700, x: 12, y: 34, maximized: true });
        save(storage, STORAGE_KEYS.window, { width: 1000, height: 700, x: "left" });
        expect(loadWindowGeometry(storage)).toEqual({ width: 1000, height: 700 });
        save(storage, STORAGE_KEYS.window, { width: 50, height: 700 });
        expect(loadWindowGeometry(storage)).toEqual(DEFAULT_WINDOW);
    });
});

describe("chatterino settings", () => {
    test("the import answer starts unset and persists once given", () => {
        const storage = memoryStorage();
        expect(loadSettings(storage).importFromChatterino).toBeUndefined();
        expect(loadSettings(storage).syncChatterinoSettings).toBe(false);
        save(storage, STORAGE_KEYS.settings, { ...loadSettings(storage), importFromChatterino: false, syncChatterinoSettings: true });
        expect(loadSettings(storage).importFromChatterino).toBe(false);
        expect(loadSettings(storage).syncChatterinoSettings).toBe(true);
        save(storage, STORAGE_KEYS.settings, { importFromChatterino: "yes" });
        expect(loadSettings(storage).importFromChatterino).toBeUndefined();
    });
});
