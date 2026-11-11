import type {
    Account,
    AccountsState,
    BlacklistedUser,
    CustomCommand,
    FilterRecord,
    HighlightBadge,
    HighlightPhrase,
    HighlightUser,
    IgnoredPhrase,
    ModerationAction,
    Nickname,
    Settings,
    SplitLeaf,
    SplitNode,
    TabLayout,
    ThemeName,
    TimeoutButton,
    WindowLayout,
} from "../api";
import { ENUM_PATHS } from "./enumPaths";
import { SETTING_PATHS } from "./settingPaths";

type Json = Record<string, unknown>;

export type ChatterinoUiPrefs = {
    showMessageLength?: boolean;
    fadeMessageHistory?: boolean;
    showTabCloseButton?: boolean;
    showTabLive?: boolean;
    lockTabs?: boolean;
    tabVisibility?: "all" | "live";
};

export type ImportedWindow = { width: number; height: number; x?: number; y?: number; maximized?: boolean };

export type ImportedLayout = { layout: WindowLayout; mutedTabIds: string[]; window?: ImportedWindow };

const UI_PREF_PATHS: Record<Exclude<keyof ChatterinoUiPrefs, "tabVisibility">, string> = {
    showMessageLength: "/appearance/messages/showMessageLength",
    fadeMessageHistory: "/appearance/messages/fadeMessageHistory",
    showTabCloseButton: "/appearance/showTabCloseButton",
    showTabLive: "/appearance/showTabLiveButton",
    lockTabs: "/misc/lockNotebookLayout",
};
const TAB_VISIBILITY: Record<string, "all" | "live"> = { "0": "all", "1": "live" };
const TIMEOUT_UNITS = new Set(["s", "m", "h", "d", "w"]);

const THEMES: Record<string, ThemeName> = { white: "white", light: "light", dark: "dark", black: "black" };
const SPECIAL_SPLITS: Record<string, string> = { mentions: "/mentions", whispers: "/whispers", watching: "/watching", live: "/live", automod: "/automod" };

function isObject(value: unknown): value is Json {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function at(root: unknown, path: string): unknown {
    let node = root;
    for (const part of path.split("/").filter(Boolean)) {
        if (!isObject(node)) return undefined;
        node = node[part];
    }
    return node;
}

function text(value: unknown): string {
    return typeof value === "string" ? value : "";
}

export function argbToCss(value: string): string {
    const match = /^#([0-9a-f]{8})$/i.exec(value.trim());
    if (!match) return value;
    const raw = match[1];
    return `#${raw.slice(2)}${raw.slice(0, 2)}`.toLowerCase();
}

function enumValue(values: Record<string, string>, raw: unknown): string | undefined {
    if (typeof raw !== "string" && typeof raw !== "number") return undefined;
    const key = String(raw).toLowerCase();
    const match = Object.entries(values).find(([candidate]) => candidate.toLowerCase() === key);
    return match?.[1];
}

function themeName(raw: unknown): ThemeName | undefined {
    return THEMES[text(raw).toLowerCase()];
}

function themePatch(root: Json): Partial<Settings> {
    const patch: Partial<Settings> = {};
    const name = text(at(root, "/appearance/theme/name"));
    if (name.toLowerCase() === "system") patch.systemTheme = true;
    const theme = themeName(name);
    if (theme) {
        patch.systemTheme = false;
        patch.theme = theme;
    }
    const dark = themeName(at(root, "/appearance/theme/darkSystem"));
    const light = themeName(at(root, "/appearance/theme/lightSystem"));
    if (dark) patch.darkSystemTheme = dark;
    if (light) patch.lightSystemTheme = light;
    return patch;
}

function scalarPatch(root: Json): Partial<Settings> {
    const patch: Record<string, unknown> = {};
    for (const [key, path] of Object.entries(SETTING_PATHS)) {
        const value = at(root, path as string);
        if (value === undefined || value === null || typeof value === "object") continue;
        patch[key] = typeof value === "string" && key.endsWith("Color") ? argbToCss(value) : value;
    }
    for (const [key, rule] of Object.entries(ENUM_PATHS)) {
        if (!rule) continue;
        const value = enumValue(rule.values, at(root, rule.path));
        if (value !== undefined) patch[key] = value;
    }
    const hideModerated = at(root, "/appearance/messages/hideModerated");
    if (typeof hideModerated === "boolean") patch.showDeletedMessages = !hideModerated;
    return patch as Partial<Settings>;
}

function list(root: Json, path: string): Json[] {
    const value = at(root, path);
    return Array.isArray(value) ? value.filter(isObject) : [];
}

function colorOf(entry: Json): string | undefined {
    const color = text(entry.color);
    return color ? argbToCss(color) : undefined;
}

function highlightPhrase(entry: Json): HighlightPhrase {
    const phrase: HighlightPhrase = {
        pattern: text(entry.pattern),
        isRegex: entry.regex === true,
        caseSensitive: entry.case === true,
        playSound: entry.sound === true,
        alert: entry.alert === true,
        showInMentions: entry.showInMentions !== false,
    };
    const color = colorOf(entry);
    if (color) phrase.color = color;
    if (text(entry.soundUrl)) phrase.soundUrl = text(entry.soundUrl);
    return phrase;
}

function highlightUser(entry: Json): HighlightUser {
    const user: HighlightUser = {
        login: text(entry.pattern),
        playSound: entry.sound === true,
        alert: entry.alert === true,
        showInMentions: entry.showInMentions === true,
    };
    const color = colorOf(entry);
    if (color) user.color = color;
    if (entry.regex === true) user.isRegex = true;
    if (entry.case === true) user.caseSensitive = true;
    if (text(entry.soundUrl)) user.soundUrl = text(entry.soundUrl);
    return user;
}

function ignoredPhrase(entry: Json): IgnoredPhrase {
    return {
        pattern: text(entry.pattern),
        isRegex: entry.regex === true,
        caseSensitive: entry.caseSensitive === true,
        isBlock: entry.isBlock !== false,
        replaceWith: text(entry.replaceWith),
    };
}

function nickname(entry: Json): Nickname {
    return { name: text(entry.name), replace: text(entry.replace), isRegex: entry.isRegex === true, caseSensitive: entry.isCaseSensitive === true };
}

function command(entry: Json): CustomCommand {
    return { trigger: text(entry.name), command: text(entry.func), showInMessageMenu: entry.showInMsgContextMenu === true };
}

function highlightBadge(entry: Json): HighlightBadge {
    const badge: HighlightBadge = {
        name: text(entry.name),
        displayName: text(entry.displayName) || text(entry.name),
        showInMentions: entry.showInMentions === true,
        alert: entry.alert === true,
        playSound: entry.sound === true,
    };
    const color = colorOf(entry);
    if (color) badge.color = color;
    if (text(entry.soundUrl)) badge.soundUrl = text(entry.soundUrl);
    return badge;
}

function blacklistedUser(entry: Json): BlacklistedUser {
    return { pattern: text(entry.pattern), isRegex: entry.regex === true };
}

function moderationAction(entry: Json): ModerationAction {
    const action: ModerationAction = { action: text(entry.pattern) };
    if (text(entry.icon)) action.iconPath = text(entry.icon);
    return action;
}

function filterRecord(entry: Json): FilterRecord {
    return { id: text(entry.id), name: text(entry.name), filter: text(entry.filter) };
}

function timeoutButton(entry: unknown): TimeoutButton | undefined {
    const pair = Array.isArray(entry) ? { unit: entry[0], value: entry[1] } : entry;
    if (!isObject(pair)) return undefined;
    const unit = text(pair.unit);
    const value = pair.value;
    if (!TIMEOUT_UNITS.has(unit) || typeof value !== "number") return undefined;
    return { unit: unit as TimeoutButton["unit"], value };
}

function listPatch(root: Json): Partial<Settings> {
    const patch: Partial<Settings> = {};
    const hasList = (path: string) => Array.isArray(at(root, path));
    if (hasList("/highlighting/highlights")) patch.highlightPhrases = list(root, "/highlighting/highlights").map(highlightPhrase);
    if (hasList("/highlighting/users")) patch.highlightUsers = list(root, "/highlighting/users").map(highlightUser);
    if (hasList("/ignore/phrases")) patch.ignoredPhrases = list(root, "/ignore/phrases").map(ignoredPhrase);
    if (hasList("/nicknames")) patch.nicknames = list(root, "/nicknames").map(nickname);
    if (hasList("/commands")) patch.commands = list(root, "/commands").map(command);
    if (hasList("/highlighting/badges")) patch.highlightBadges = list(root, "/highlighting/badges").map(highlightBadge);
    if (hasList("/highlighting/blacklist")) patch.blacklistedUsers = list(root, "/highlighting/blacklist").map(blacklistedUser);
    if (hasList("/moderation/actions")) patch.moderationActions = list(root, "/moderation/actions").map(moderationAction);
    if (hasList("/filtering/filters")) patch.filters = list(root, "/filtering/filters").map(filterRecord);
    if (hasList("/logging/channels")) patch.loggedChannels = list(root, "/logging/channels").map((entry) => text(entry.channelName));
    const timeouts = at(root, "/timeouts/timeoutButtons");
    if (Array.isArray(timeouts)) {
        const buttons = timeouts.map(timeoutButton).filter((button): button is TimeoutButton => button !== undefined);
        if (buttons.length > 0) patch.timeoutButtons = buttons;
    }
    const muted = at(root, "/pings/muted");
    if (Array.isArray(muted)) patch.mutedChannels = muted.filter((name): name is string => typeof name === "string");
    return patch;
}

export function uiPrefsFromChatterino(settingsJson: unknown): ChatterinoUiPrefs {
    const prefs: Record<string, unknown> = {};
    for (const [key, path] of Object.entries(UI_PREF_PATHS)) {
        const value = at(settingsJson, path);
        if (typeof value === "boolean") prefs[key] = value;
    }
    const visibility = enumValue(TAB_VISIBILITY, at(settingsJson, "/appearance/tabVisibility"));
    if (visibility) prefs.tabVisibility = visibility;
    return prefs as ChatterinoUiPrefs;
}

export function settingsFromChatterino(settingsJson: unknown): Partial<Settings> {
    if (!isObject(settingsJson)) return {};
    return { ...scalarPatch(settingsJson), ...themePatch(settingsJson), ...listPatch(settingsJson) };
}

function account(entry: unknown): Account | undefined {
    if (!isObject(entry)) return undefined;
    const login = text(entry.username).trim().toLowerCase();
    const userId = text(entry.userID).trim();
    const clientId = text(entry.clientID).trim();
    const token = text(entry.oauthToken).trim().replace(/^oauth:/, "");
    if (!login || !userId || !clientId || !token) return undefined;
    return { login, userId, clientId, token, scopes: [] };
}

export function accountsFromChatterino(settingsJson: unknown): AccountsState {
    const accounts = at(settingsJson, "/accounts");
    if (!isObject(accounts)) return { accounts: [] };
    const found = Object.entries(accounts)
        .filter(([key]) => key.startsWith("uid"))
        .map(([, entry]) => account(entry))
        .filter((entry): entry is Account => entry !== undefined);
    const current = text(accounts.current).toLowerCase();
    const state: AccountsState = { accounts: found };
    if (found.some((entry) => entry.login === current)) state.current = current;
    return state;
}

type IdSource = (prefix: string) => string;

function splitChannel(data: unknown): string | undefined {
    if (!isObject(data)) return undefined;
    const type = text(data.type);
    if (type === "twitch") return text(data.name).trim().replace(/^#/, "").toLowerCase() || undefined;
    return SPECIAL_SPLITS[type];
}

function splitNode(node: unknown, nextId: IdSource): SplitNode | undefined {
    if (!isObject(node)) return undefined;
    const type = text(node.type);
    if (type === "split") {
        const channel = splitChannel(node.data);
        if (!channel) return undefined;
        const leaf: SplitLeaf = { type: "split", id: nextId("split"), channel };
        if (node.moderationMode === true) leaf.moderationMode = true;
        const filters = Array.isArray(node.filters) ? node.filters.filter((id): id is string => typeof id === "string" && id !== "") : [];
        if (filters.length > 0) leaf.filters = filters;
        return leaf;
    }
    if (type !== "horizontal" && type !== "vertical") return undefined;
    const items = Array.isArray(node.items) ? node.items : [];
    const flexKey = type === "horizontal" ? "flexh" : "flexv";
    const children: SplitNode[] = [];
    const sizes: number[] = [];
    for (const item of items) {
        const child = splitNode(item, nextId);
        if (!child) continue;
        children.push(child);
        const flex = isObject(item) ? item[flexKey] : undefined;
        sizes.push(typeof flex === "number" && flex > 0 ? flex : 1);
    }
    if (children.length === 0) return undefined;
    if (children.length === 1) return children[0];
    const total = sizes.reduce((sum, size) => sum + size, 0);
    return { type: "container", id: nextId("container"), direction: type, children, sizes: sizes.map((size) => size / total) };
}

function windowGeometry(main: Json): ImportedWindow | undefined {
    const { width, height, x, y } = main;
    const sized = typeof width === "number" && typeof height === "number" && width > 0 && height > 0;
    if (!sized) return undefined;
    const geometry: ImportedWindow = { width: width as number, height: height as number };
    const placed = typeof x === "number" && typeof y === "number" && (x as number) >= 0 && (y as number) >= 0;
    if (placed) {
        geometry.x = x as number;
        geometry.y = y as number;
    }
    if (main.state === "maximized") geometry.maximized = true;
    return geometry;
}

function firstLeaf(node: SplitNode): string {
    return node.type === "split" ? node.id : firstLeaf(node.children[0]);
}

export function layoutFromChatterino(layoutJson: unknown, nextId: IdSource): ImportedLayout | undefined {
    const windows = at(layoutJson, "/windows");
    if (!Array.isArray(windows)) return undefined;
    const main = windows.find((window) => isObject(window) && window.type === "main") ?? windows[0];
    if (!isObject(main) || !Array.isArray(main.tabs)) return undefined;
    const tabs: TabLayout[] = [];
    const mutedTabIds: string[] = [];
    let selectedTabId: string | undefined;
    for (const entry of main.tabs) {
        if (!isObject(entry)) continue;
        const root = splitNode(entry.splits2, nextId) ?? null;
        const tab: TabLayout = { id: nextId("tab"), root };
        if (text(entry.title)) tab.title = text(entry.title);
        if (root) tab.focusedSplitId = firstLeaf(root);
        tabs.push(tab);
        if (entry.selected === true) selectedTabId = tab.id;
        if (entry.highlightsEnabled === false) mutedTabIds.push(tab.id);
    }
    if (tabs.length === 0) return undefined;
    const imported: ImportedLayout = { layout: { tabs, selectedTabId: selectedTabId ?? tabs[0].id }, mutedTabIds };
    const window = windowGeometry(main);
    if (window) imported.window = window;
    return imported;
}
