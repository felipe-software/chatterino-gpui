import { resolvePage, type SettingsPageName } from "../../settings/settingsPages";

export const MODERN_GENERAL_PAGES = ["Appearance", "Chat", "Emotes and badges", "Streamer mode", "Advanced"] as const;

export type ModernGeneralPageName = (typeof MODERN_GENERAL_PAGES)[number];

export type ModernPageName = ModernGeneralPageName | Exclude<SettingsPageName, "General">;

export type ModernNavGroup = { title: string; pages: ModernPageName[] };

export const MODERN_NAV_GROUPS: ModernNavGroup[] = [
    { title: "General", pages: [...MODERN_GENERAL_PAGES] },
    { title: "People", pages: ["Accounts", "Nicknames"] },
    { title: "Rules", pages: ["Commands", "Highlights", "Ignores", "Filters"] },
    { title: "Tools", pages: ["Hotkeys", "Moderation", "Live Notifications", "External tools", "Plugins"] },
];

export const MODERN_PAGE_ORDER: ModernPageName[] = [...MODERN_NAV_GROUPS.flatMap((group) => group.pages), "About"];

const LABELS: Partial<Record<ModernPageName, string>> = { "Live Notifications": "Live notifications" };

const ALIASES: Record<string, ModernPageName> = {
    General: "Appearance",
    StreamerMode: "Streamer mode",
    "Streamer Mode": "Streamer mode",
    Emotes: "Emotes and badges",
};

export function modernPageLabel(page: ModernPageName): string {
    return LABELS[page] ?? page;
}

export function isModernGeneralPage(page: string): page is ModernGeneralPageName {
    return (MODERN_GENERAL_PAGES as readonly string[]).includes(page);
}

export function resolveModernPage(page: string | undefined): ModernPageName {
    if (!page) return "Appearance";
    if (isModernGeneralPage(page)) return page;
    const alias = ALIASES[page];
    if (alias) return alias;
    const classic = resolvePage(page === "ModerationActions" ? "Moderation" : page);
    return classic === "General" ? "Appearance" : classic;
}

export function classicPageFor(page: string): string {
    return isModernGeneralPage(page) ? "General" : page;
}

const FOOTER_HINTS: Partial<Record<ModernPageName, string>> = {
    Appearance: "Theme and accent preview live. Save to keep them.",
    "Emotes and badges": "Live updates need a restart.",
    Advanced: "Some changes here need a restart.",
};

const DEFAULT_FOOTER_HINT = "Changes apply when you save.";

export function modernFooterHint(page: ModernPageName): string {
    return FOOTER_HINTS[page] ?? DEFAULT_FOOTER_HINT;
}
