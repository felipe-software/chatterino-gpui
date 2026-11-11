import type { EmoteInfo } from "../../data/api";

export type EmoteTab = "Subs" | "Channel" | "Global" | "Emojis";

export const EMOTE_TABS: EmoteTab[] = ["Subs", "Channel", "Global", "Emojis"];

export type EmoteSection = { title: string; emotes: EmoteInfo[]; empty?: string; provider?: EmoteInfo["provider"]; scope?: EmoteInfo["scope"] };

const NO_EMOTES = "no emotes available";
const NO_SUB_EMOTES = "no subscription emotes available";

const PROVIDERS: Array<{ provider: EmoteInfo["provider"]; title: string }> = [
    { provider: "bttv", title: "BetterTTV" },
    { provider: "ffz", title: "FrankerFaceZ" },
    { provider: "7tv", title: "7TV" },
];

const PROVIDER_NAMES: Record<EmoteInfo["provider"], string> = {
    twitch: "Twitch",
    bttv: "BetterTTV",
    ffz: "FrankerFaceZ",
    "7tv": "7TV",
    emoji: "Emoji",
};

export function compareEmoteNames(a: string, b: string): number {
    const lowerA = a.toLowerCase();
    const lowerB = b.toLowerCase();
    if (lowerA !== lowerB) return lowerA < lowerB ? -1 : 1;
    if (a === b) return 0;
    return a > b ? -1 : 1;
}

function sorted(emotes: EmoteInfo[]): EmoteInfo[] {
    return [...emotes].sort((a, b) => compareEmoteNames(a.name, b.name));
}

type SectionSource = Pick<EmoteSection, "provider" | "scope">;

function section(title: string, emotes: EmoteInfo[], source: SectionSource = {}, empty = NO_EMOTES): EmoteSection {
    return emotes.length > 0 ? { title, emotes: sorted(emotes), ...source } : { title, emotes: [], empty, ...source };
}

function providerSections(emotes: EmoteInfo[], scope: EmoteInfo["scope"]): EmoteSection[] {
    return PROVIDERS.map(({ provider, title }) =>
        section(
            title,
            emotes.filter((emote) => emote.provider === provider && emote.scope === scope),
            { provider, scope },
        ),
    );
}

export function emoteSections(tab: EmoteTab, emotes: EmoteInfo[], channel: string, isTwitchChannel = true): EmoteSection[] {
    switch (tab) {
        case "Subs": {
            const follower = emotes.filter((emote) => emote.scope === "follower");
            const subscriber = emotes.filter((emote) => emote.scope === "subscriber");
            const sections: EmoteSection[] = [];
            if (follower.length > 0) sections.push(section(`${channel} (Follower)`, follower, { provider: "twitch", scope: "follower" }));
            if (subscriber.length > 0) sections.push(section("Twitch", subscriber, { provider: "twitch", scope: "subscriber" }));
            if (sections.length === 0) return [{ title: "", emotes: [], empty: NO_SUB_EMOTES }];
            return sections;
        }
        case "Channel":
            return isTwitchChannel ? providerSections(emotes, "channel") : [];
        case "Global": {
            const twitch = emotes.filter((emote) => emote.provider === "twitch" && emote.scope === "global");
            const sections = twitch.length > 0 ? [section("Twitch", twitch, { provider: "twitch", scope: "global" })] : [];
            return [...sections, ...providerSections(emotes, "global")];
        }
        case "Emojis":
            return [{ title: "Emojis", emotes: emotes.filter((emote) => emote.provider === "emoji"), provider: "emoji" }];
    }
}

type SearchGroup = SectionSource & { title: (channel: string) => string; matches: (emote: EmoteInfo) => boolean };

const SEARCH_GROUPS: SearchGroup[] = [
    { title: (channel) => `${channel} (Follower)`, provider: "twitch", scope: "follower", matches: (emote) => emote.scope === "follower" },
    { title: () => "Twitch", provider: "twitch", matches: (emote) => emote.provider === "twitch" && emote.scope !== "follower" },
    { title: () => "BetterTTV (Global)", provider: "bttv", scope: "global", matches: (emote) => emote.provider === "bttv" && emote.scope === "global" },
    { title: () => "FrankerFaceZ (Global)", provider: "ffz", scope: "global", matches: (emote) => emote.provider === "ffz" && emote.scope === "global" },
    { title: () => "7TV (Global)", provider: "7tv", scope: "global", matches: (emote) => emote.provider === "7tv" && emote.scope === "global" },
    { title: () => "BetterTTV (Channel)", provider: "bttv", scope: "channel", matches: (emote) => emote.provider === "bttv" && emote.scope === "channel" },
    { title: () => "FrankerFaceZ (Channel)", provider: "ffz", scope: "channel", matches: (emote) => emote.provider === "ffz" && emote.scope === "channel" },
    { title: () => "7TV (Channel)", provider: "7tv", scope: "channel", matches: (emote) => emote.provider === "7tv" && emote.scope === "channel" },
    { title: () => "Emojis", provider: "emoji", matches: (emote) => emote.provider === "emoji" },
];

export function searchSections(
    emotes: EmoteInfo[],
    query: string,
    channel = "",
    searchName: (emote: EmoteInfo) => string = (emote) => emote.name,
): EmoteSection[] {
    const needle = query.trim().toLowerCase();
    const matching = emotes.filter((emote) => searchName(emote).toLowerCase().includes(needle));
    return SEARCH_GROUPS.map((group) => ({
        title: group.title(channel),
        emotes: sorted(matching.filter(group.matches)),
        provider: group.provider,
        scope: group.scope,
    })).filter((entry) => entry.emotes.length > 0);
}

export const EMOTE_TAB_LABELS: Record<EmoteTab, string> = { Subs: "Subs", Channel: "Channel", Global: "Global", Emojis: "Emoji" };

export type EmoteListView = {
    sections: EmoteSection[];
    note?: string;
    empty?: { title: string; description?: string };
};

function joinNames(names: string[]): string {
    if (names.length <= 1) return names.join("");
    return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function modernSectionTitle(entry: EmoteSection, channel: string, searching: boolean): string {
    const name = entry.provider ? PROVIDER_NAMES[entry.provider] : entry.title;
    if (entry.scope === "follower") return `Follower emotes · ${channel}`;
    if (entry.scope === "subscriber") return "Subscriber emotes";
    if (entry.scope === "channel") return `${name} · ${channel}`;
    if (entry.scope === "global" && searching && entry.provider !== "twitch") return `${name} · Global`;
    return name;
}

function missingNote(missing: string[], tab: EmoteTab): string | undefined {
    if (missing.length === 0) return undefined;
    const verb = missing.length === 1 ? "has" : "have";
    const where = tab === "Channel" ? "emotes in this channel" : "global emotes";
    return `${joinNames(missing)} ${verb} no ${where}.`;
}

export function modernEmoteView(tab: EmoteTab, sections: EmoteSection[], channel: string, searching: boolean, query = ""): EmoteListView {
    const filled = sections
        .filter((entry) => entry.emotes.length > 0)
        .map((entry) => ({ ...entry, title: modernSectionTitle(entry, channel, searching) }));
    if (searching) {
        if (filled.length > 0) return { sections: filled };
        return { sections: [], empty: { title: "No emotes found", description: `Nothing matches "${query.trim()}".` } };
    }
    const missing = sections.flatMap((entry) => {
        const isEmptyProvider = entry.emotes.length === 0 && !!entry.provider && entry.provider !== "emoji";
        return isEmptyProvider && entry.provider ? [PROVIDER_NAMES[entry.provider]] : [];
    });
    const note = missingNote(missing, tab);
    if (filled.length > 0) return { sections: filled, note };
    if (tab === "Subs") return { sections: [], empty: { title: "No subscriber emotes yet", description: "Emotes from channels you subscribe to show up here." } };
    if (tab === "Channel") return { sections: [], empty: { title: "No channel emotes", description: note ?? "This split isn't a Twitch channel." } };
    return { sections: [], empty: { title: "No emotes", description: note } };
}

export function emoteSourceLabel(emote: EmoteInfo): string {
    if (emote.provider === "emoji") return "Emoji";
    return `${PROVIDER_NAMES[emote.provider]} · ${emote.scope} emote`;
}

export function familySections(emotes: EmoteInfo[], families: Map<string, string>): EmoteSection[] {
    const groups = new Map<string, EmoteInfo[]>();
    for (const emote of emotes) {
        const key = families.get(emote.name) ?? "";
        const list = groups.get(key);
        if (list) list.push(emote);
        else groups.set(key, [emote]);
    }
    const named = [...groups.entries()]
        .filter(([key]) => key)
        .sort(([keyA, a], [keyB, b]) => b.length - a.length || keyA.localeCompare(keyB))
        .map(([key, list]) => ({ title: key, emotes: sorted(list) }));
    const rest = groups.get("");
    if (rest) named.push({ title: named.length > 0 ? "Other" : "All emotes", emotes: sorted(rest) });
    return named;
}
