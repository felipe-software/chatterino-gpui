import { describe, expect, test } from "bun:test";
import { generalItems } from "../../settings/generalOptions";
import { ACCENT_ITEM_ID, MODERN_GENERAL, THEME_ITEM_ID, type ModernItemRowSpec } from "./modernGeneralPages";
import { displayOptions, indexItems } from "./modernRows";
import { filterModernPage, modernGeneralPageMatches } from "./modernSearch";
import { MODERN_GENERAL_PAGES, resolveModernPage } from "./modernSettingsPages";

const STRUCTURAL = new Set(["title", "subtitle", "description", "separator"]);
const items = generalItems();
const index = indexItems(items);

function itemRows(): ModernItemRowSpec[] {
    return Object.values(MODERN_GENERAL).flatMap((page) =>
        page.sections.flatMap((section) =>
            section.blocks.flatMap((block) => {
                if (block.kind === "rows") return block.rows.filter((row): row is ModernItemRowSpec => row.kind === "item");
                if (block.kind === "theme") return [...block.system, ...block.rows];
                return [];
            }),
        ),
    );
}

function placedIds(): string[] {
    return Object.values(MODERN_GENERAL).flatMap((page) =>
        page.sections.flatMap((section) =>
            section.blocks.flatMap((block) => {
                switch (block.kind) {
                    case "rows":
                        return block.rows.filter((row) => row.kind === "item").map((row) => row.id);
                    case "theme":
                        return [THEME_ITEM_ID, ACCENT_ITEM_ID, ...block.system.map((row) => row.id), ...block.rows.map((row) => row.id)];
                    case "providers":
                        return block.providers.flatMap((provider) => provider.cells.filter((cell): cell is string => cell !== null));
                    case "badges":
                        return block.badges.map((badge) => badge.id);
                }
            }),
        ),
    );
}

function pagesMatching(query: string): string[] {
    return MODERN_GENERAL_PAGES.filter((name) => modernGeneralPageMatches(MODERN_GENERAL[name], index, query));
}

describe("Modern general pages", () => {
    test("place every General setting exactly once", () => {
        const interactive = items.filter((item) => !STRUCTURAL.has(item.kind)).map((item) => item.id);
        const placed = placedIds();
        expect(placed.filter((id) => !interactive.includes(id))).toEqual([]);
        expect(interactive.filter((id) => !placed.includes(id))).toEqual([]);
        expect(placed.length).toBe(new Set(placed).size);
    });

    test("only relabel options the setting has", () => {
        for (const row of itemRows()) {
            const item = index.get(row.id);
            if (item?.kind !== "dropdown") continue;
            const values = item.options.map((option) => option.value);
            const named = [...(row.options ?? []).map((option) => option.value), ...Object.keys(row.relabel ?? {})];
            expect(named.filter((value) => !values.includes(value))).toEqual([]);
            expect(displayOptions(item.options, row).length).toBeGreaterThan(0);
        }
    });

    test("link rows point at description links", () => {
        const links = Object.values(MODERN_GENERAL).flatMap((page) =>
            page.sections.flatMap((section) => section.blocks.flatMap((block) => (block.kind === "rows" ? block.rows : []))),
        );
        for (const row of links) {
            if (row.kind !== "links") continue;
            for (const link of row.links) {
                const item = index.get(link.from);
                expect(item?.kind === "description" && !!item.links?.[0]?.url).toBe(true);
            }
        }
    });

    test("search matches Modern labels, Chatterino labels and section titles", () => {
        expect(pagesMatching("smooth scrolling")).toEqual(["Chat"]);
        expect(pagesMatching("Separate with lines")).toEqual(["Chat"]);
        expect(pagesMatching("accent")).toContain("Appearance");
        expect(pagesMatching("7tv")).toEqual(["Emotes and badges"]);
        expect(pagesMatching("restricted users")).toEqual(["Streamer mode"]);
        expect(pagesMatching("zzzz-nothing")).toEqual([]);
    });

    test("filters a page down to the matching rows", () => {
        const filters = filterModernPage(MODERN_GENERAL.Appearance, index, "close button");
        const tabs = MODERN_GENERAL.Appearance.sections.findIndex((section) => section.title === "Tabs");
        expect(filters[tabs]?.keys.has("showTabCloseButton")).toBe(true);
        expect(filters[tabs]?.keys.has("tabStyle")).toBe(false);
        expect(filters.filter((filter) => filter.show).length).toBe(1);
    });

    test("resolve requested pages", () => {
        expect(resolveModernPage(undefined)).toBe("Appearance");
        expect(resolveModernPage("General")).toBe("Appearance");
        expect(resolveModernPage("StreamerMode")).toBe("Streamer mode");
        expect(resolveModernPage("ModerationActions")).toBe("Moderation");
        expect(resolveModernPage("Notifications")).toBe("Live Notifications");
        expect(resolveModernPage("Accounts")).toBe("Accounts");
    });
});
