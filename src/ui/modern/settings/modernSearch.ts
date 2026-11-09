import { itemKeywords } from "../../settings/generalTypes";
import { ACCENT_ITEM_ID, THEME_ITEM_ID, THEME_TILES, type ModernBlock, type ModernGeneralPage, type ModernRowSpec, type ModernSection } from "./modernGeneralPages";
import type { ItemIndex } from "./modernRows";

export type SectionFilter = { show: boolean; all: boolean; keys: Set<string> };

const SHOW_ALL: SectionFilter = { show: true, all: true, keys: new Set() };

function needleOf(query: string): string {
    return query.trim().toLowerCase();
}

function contains(text: string | undefined, needle: string): boolean {
    return !!text && text.toLowerCase().includes(needle);
}

function itemWords(items: ItemIndex, id: string): string[] {
    const item = items.get(id);
    if (!item) return [];
    const words = itemKeywords(item);
    if (item.kind === "dropdown") words.push(...item.options.map((option) => option.label));
    return words;
}

export function rowKeywords(row: ModernRowSpec, items: ItemIndex): string[] {
    if (row.kind === "links") return [row.label, row.hint ?? "", ...row.links.map((link) => link.label)];
    return [
        row.label ?? "",
        row.hint ?? "",
        ...(row.options ?? []).map((option) => option.label),
        ...Object.values(row.relabel ?? {}),
        ...Object.values(row.buttonLabels ?? {}),
        ...itemWords(items, row.id),
    ];
}

export function blockKey(block: ModernBlock, index: number): string {
    return `${block.kind}-${index}`;
}

function blockKeywords(block: ModernBlock, items: ItemIndex): string[] {
    switch (block.kind) {
        case "rows":
            return block.rows.flatMap((row) => rowKeywords(row, items));
        case "theme":
            return [
                "Theme",
                "Accent colour",
                "Accent color",
                ...THEME_TILES.map((tile) => tile.label),
                ...itemWords(items, THEME_ITEM_ID),
                ...itemWords(items, ACCENT_ITEM_ID),
                ...[...block.system, ...block.rows].flatMap((row) => rowKeywords(row, items)),
            ];
        case "providers":
            return [...block.columns, ...block.providers.flatMap((provider) => [provider.name, ...provider.cells.flatMap((cell) => (cell ? itemWords(items, cell) : []))])];
        case "badges":
            return block.badges.flatMap((badge) => [badge.label, ...itemWords(items, badge.id)]);
    }
}

export function filterSection(section: ModernSection, items: ItemIndex, query: string): SectionFilter {
    const needle = needleOf(query);
    if (!needle || contains(section.title, needle) || contains(section.description, needle)) return SHOW_ALL;
    const keys = new Set<string>();
    section.blocks.forEach((block, index) => {
        if (block.kind !== "rows") {
            if (blockKeywords(block, items).some((word) => contains(word, needle))) keys.add(blockKey(block, index));
            return;
        }
        for (const row of block.rows) {
            if (rowKeywords(row, items).some((word) => contains(word, needle))) keys.add(row.id);
        }
    });
    return { show: keys.size > 0, all: false, keys };
}

export function filterModernPage(page: ModernGeneralPage, items: ItemIndex, query: string): SectionFilter[] {
    const needle = needleOf(query);
    const pageMatches = !needle || contains(page.name, needle) || contains(page.description, needle);
    return page.sections.map((section) => (pageMatches ? SHOW_ALL : filterSection(section, items, query)));
}

export function modernGeneralPageMatches(page: ModernGeneralPage, items: ItemIndex, query: string): boolean {
    return filterModernPage(page, items, query).some((filter) => filter.show);
}
