import { describe, expect, test } from "bun:test";
import type { EmoteInfo } from "../../data/api";
import { emoteFamilies } from "./emoteFamilies";
import { layoutEmoteGrid, layoutTileGrid, stickyHeader, visibleRows } from "./emoteGridLayout";
import { compareEmoteNames, emoteSections, emoteSourceLabel, familySections, modernEmoteView, searchSections } from "./emoteSections";
import { normalizeChannelName, stepSelection, switcherItems } from "./switcherItems";

function emote(name: string, provider: EmoteInfo["provider"], scope: EmoteInfo["scope"], width = 28): EmoteInfo {
    return { name, url: `https://example.com/${name}`, width, height: 28, provider, scope };
}

const emotes = [
    emote("Kappa", "twitch", "global"),
    emote("forsenE", "twitch", "subscriber"),
    emote("OMEGALUL", "bttv", "channel"),
    emote("catJAM", "7tv", "channel"),
    emote("PogU", "ffz", "global"),
    emote("Clap", "bttv", "global"),
    emote("smile", "emoji", "global"),
];

function titles(sections: ReturnType<typeof emoteSections>): string[] {
    return sections.map((section) => (section.emotes.length > 0 ? section.title : `${section.title}: ${section.empty}`));
}

describe("emote popup sections (EmotePopup::loadChannel)", () => {
    test("Channel tab always lists BetterTTV, FrankerFaceZ and 7TV", () => {
        expect(titles(emoteSections("Channel", emotes, "forsen"))).toEqual(["BetterTTV", "FrankerFaceZ: no emotes available", "7TV"]);
        expect(emoteSections("Channel", emotes, "/mentions", false)).toEqual([]);
    });

    test("Global tab starts with Twitch when there are Twitch globals", () => {
        expect(titles(emoteSections("Global", emotes, "forsen"))).toEqual(["Twitch", "BetterTTV", "FrankerFaceZ", "7TV: no emotes available"]);
    });

    test("Subs says so when empty, Emojis lists emoji", () => {
        expect(titles(emoteSections("Subs", [], "forsen"))).toEqual([": no subscription emotes available"]);
        expect(emoteSections("Subs", emotes, "forsen")[0].emotes.map((entry) => entry.name)).toEqual(["forsenE"]);
        expect(emoteSections("Emojis", emotes, "forsen")[0].emotes.map((entry) => entry.name)).toEqual(["smile"]);
    });

    test("search groups globals before channel emotes", () => {
        expect(searchSections(emotes, "a", "forsen").map((section) => section.title)).toEqual([
            "Twitch",
            "BetterTTV (Global)",
            "BetterTTV (Channel)",
            "7TV (Channel)",
        ]);
    });

    test("names sort case-insensitively with LuL before LUL", () => {
        expect(["LUL", "LuL", "abc"].sort(compareEmoteNames)).toEqual(["abc", "LuL", "LUL"]);
    });
});

describe("emote grid layout (centered messages)", () => {
    const metrics = { width: 300, textLine: 16.4, space: 4, scale: 1 };

    test("titles take one text line and emote lines wrap and center", () => {
        const many = Array.from({ length: 10 }, (_, index) => emote(`e${index}`, "bttv", "channel"));
        const layout = layoutEmoteGrid([{ title: "BetterTTV", emotes: many }], metrics);
        const [title, first, second] = layout.rows;
        expect(title).toMatchObject({ kind: "title", y: 0, height: 24 });
        expect(first.kind === "emotes" && first.items.length).toBe(9);
        expect(first.kind === "emotes" && first.items[0].x).toBe(8);
        expect(second.kind === "emotes" && second.items.map((item) => item.x)).toEqual([136]);
        expect(first).toMatchObject({ y: 24, height: 32 });
        expect(second).toMatchObject({ y: 56, height: 32 });
        expect(layout.height).toBe(88);
    });

    test("empty sections show their text and only nearby rows render", () => {
        const layout = layoutEmoteGrid([{ title: "7TV", emotes: [], empty: "no emotes available" }], metrics);
        expect(layout.rows.map((row) => row.kind)).toEqual(["title", "empty"]);
        expect(visibleRows(layout, 1000, 100, 0)).toEqual([]);
    });
});

describe("modern emote picker", () => {
    test("channel tab drops empty providers into a note", () => {
        const view = modernEmoteView("Channel", emoteSections("Channel", emotes, "forsen"), "forsen", false);
        expect(view.sections.map((section) => section.title)).toEqual(["BetterTTV · forsen", "7TV · forsen"]);
        expect(view.note).toBe("FrankerFaceZ has no emotes in this channel.");
        expect(view.empty).toBeUndefined();
    });

    test("empty tabs and searches become an empty state", () => {
        expect(modernEmoteView("Subs", emoteSections("Subs", [], "forsen"), "forsen", false).empty?.title).toBe("No subscriber emotes yet");
        const none = modernEmoteView("Channel", emoteSections("Channel", [], "forsen"), "forsen", false);
        expect(none.empty?.description).toBe("BetterTTV, FrankerFaceZ and 7TV have no emotes in this channel.");
        expect(modernEmoteView("Channel", [], "forsen", true, "zzz").empty?.title).toBe("No emotes found");
    });

    test("search titles say where an emote comes from", () => {
        const view = modernEmoteView("Subs", searchSections(emotes, "a", "forsen"), "forsen", true, "a");
        expect(view.sections.map((section) => section.title)).toEqual(["Twitch", "BetterTTV · Global", "BetterTTV · forsen", "7TV · forsen"]);
        expect(emoteSourceLabel(emote("catJAM", "7tv", "channel"))).toBe("7TV · channel emote");
        expect(emoteSourceLabel(emote("smile", "emoji", "global"))).toBe("Emoji");
    });

    test("tiles fill 36px columns and the note follows the last section", () => {
        const many = Array.from({ length: 13 }, (_, index) => emote(`e${index}`, "bttv", "channel"));
        const layout = layoutTileGrid([{ title: "BetterTTV · forsen", emotes: many }], 420, "FrankerFaceZ has no emotes in this channel.");
        const [header, first, second, note] = layout.rows;
        expect(layout.tile).toBeCloseTo(412 / 11);
        expect(header).toMatchObject({ kind: "header", y: 0, height: 22, count: 13, open: true });
        expect(first.kind === "tiles" && first.items.length).toBe(11);
        expect(first.kind === "tiles" && first.items[0].x).toBe(4);
        expect(second.kind === "tiles" && second.items.map((item) => item.index)).toEqual([11, 12]);
        expect(note).toMatchObject({ kind: "note", height: 16 });
        expect(layout.emotes).toHaveLength(13);
    });

    test("a closed section keeps only its header", () => {
        const layout = layoutTileGrid(
            [
                { title: "peepo", emotes: [emote("peepoHappy", "7tv", "channel")] },
                { title: "Other", emotes: [emote("YEP", "7tv", "channel")] },
            ],
            420,
            undefined,
            (title) => title !== "peepo",
        );
        expect(layout.rows.map((row) => row.kind)).toEqual(["header", "header", "tiles"]);
        expect(layout.rows[0]).toMatchObject({ open: false });
    });

    test("the sticky header is the last one above the scroll position and is pushed up by the next", () => {
        const tiles = Array.from({ length: 22 }, (_, index) => emote(`e${index}`, "7tv", "channel"));
        const layout = layoutTileGrid(
            [
                { title: "a", emotes: tiles },
                { title: "b", emotes: tiles },
            ],
            420,
        );
        expect(stickyHeader(layout, 0)).toBeUndefined();
        expect(stickyHeader(layout, 30)).toMatchObject({ header: { title: "a" }, offset: 0 });
        const second = layout.headers[1].y;
        expect(stickyHeader(layout, second - 10)).toMatchObject({ header: { title: "a" }, offset: -12 });
        expect(stickyHeader(layout, second + 1)).toMatchObject({ header: { title: "b" }, offset: 0 });
    });
});

describe("emote families (group by name)", () => {
    const names = ["peepoHappy", "peepoSad", "peepoClap", "pepeLaugh", "pepeD", "pepeJAM", "feelsbadman", "FeelsDankMan", "feelsgoodman", "monkaS", "monkaW", "monkaHmm", "gigaNod", "YEP", "NOPE"];

    test("leading camelCase words group regardless of case, lowercase names join a known family", () => {
        const families = emoteFamilies(names);
        expect(families.get("peepoClap")).toBe("peepo");
        expect(families.get("pepeD")).toBe("pepe");
        expect(families.get("FeelsDankMan")).toBe("feels");
        expect(families.get("feelsbadman")).toBe("feels");
        expect(families.get("monkaHmm")).toBe("monka");
    });

    test("groups under three emotes fall back to Other", () => {
        const families = emoteFamilies(names);
        expect(families.get("gigaNod")).toBe("");
        expect(families.get("YEP")).toBe("");
    });

    test("lowercase names sharing a 4+ letter start with two others form a group", () => {
        const families = emoteFamilies(["blobdance", "blobwave", "blobnod", "duck"]);
        expect(families.get("blobwave")).toBe("blob");
        expect(families.get("duck")).toBe("");
    });

    test("sections sort by size and end with Other", () => {
        const list = names.map((name) => emote(name, "7tv", "channel"));
        const sections = familySections(list, emoteFamilies(names));
        expect(sections.map((section) => `${section.title} ${section.emotes.length}`)).toEqual(["feels 3", "monka 3", "peepo 3", "pepe 3", "Other 3"]);
    });
});

describe("quick switcher (QuickSwitcherPopup::updateSuggestions)", () => {
    const layout = {
        selectedTabId: "a",
        tabs: [
            { id: "a", title: "Main", root: { type: "split" as const, id: "s1", channel: "forsen" } },
            { id: "b", root: { type: "split" as const, id: "s2", channel: "xqc" } },
            { id: "c", title: "Games", root: null },
        ],
    };

    test("first matching split per tab, then tab titles, then open rows", () => {
        const items = switcherItems(layout, "Fo", (channel) => channel);
        expect(items.map((item) => item.kind)).toEqual(["split", "newTab", "newPopup"]);
        expect(items[1]).toMatchObject({ channel: "fo", label: 'Open channel "Fo" in new tab' });
        expect(switcherItems(layout, "gam", (channel) => channel).map((item) => item.kind)).toEqual(["tab", "newTab", "newPopup"]);
        expect(switcherItems(layout, "", (channel) => channel).map((item) => item.key)).toEqual(["split-s1", "split-s2", "tab-c"]);
    });

    test("selection wraps", () => {
        expect(stepSelection(0, 3, -1)).toBe(2);
        expect(stepSelection(2, 3, 1)).toBe(0);
        expect(normalizeChannelName("#Forsen")).toBe("forsen");
    });
});
