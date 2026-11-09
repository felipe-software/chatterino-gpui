import { useState } from "react";
import { View, useWindowDimensions } from "@felipe-software/react-native-gpui";
import { FadeIn } from "../modern/controls/FadeIn";
import { useApp } from "../state/AppContext";
import type { MenuEntry } from "../state/overlays";
import { menuColors } from "../theme";
import { MENU_ROW_HEIGHT, MenuRow, MODERN_MENU_ROW_HEIGHT } from "./MenuRow";

type Props = { entries: MenuEntry[]; x: number; y: number; alignRight?: boolean; minWidth?: number; path: string; onDone: () => void };

type Metrics = {
    rowHeight: number;
    separatorHeight: number;
    charWidth: number;
    shortcutCharWidth: number;
    frame: number;
    submenuOverlap: number;
};

const LEGACY: Metrics = { rowHeight: MENU_ROW_HEIGHT, separatorHeight: 2, charWidth: 7.5, shortcutCharWidth: 7.5, frame: 1, submenuOverlap: 2 };
const MODERN: Metrics = { rowHeight: MODERN_MENU_ROW_HEIGHT, separatorHeight: 9, charWidth: 7.2, shortcutCharWidth: 6.8, frame: 5, submenuOverlap: 4 };
const MODERN_MIN_WIDTH = 180;
const MODERN_ROW_PADDING = 20;
const MODERN_GAP = 10;
const MODERN_MARK = 16;
const MODERN_TRAILING_ICON = 15;
const MODERN_SHORTCUT_SPACE = 16;

function entryHeight(entry: MenuEntry, metrics: Metrics): number {
    return entry.kind === "separator" ? metrics.separatorHeight : metrics.rowHeight;
}

function longestLabel(entries: MenuEntry[]): number {
    return entries.reduce((widest, entry) => (entry.kind === "separator" ? widest : Math.max(widest, entry.label.length)), 0);
}

function shortcutColumn(entries: MenuEntry[], charWidth: number): number {
    const longest = entries.reduce((widest, entry) => {
        const shortcut = entry.kind === "item" ? (entry.shortcut ?? "") : "";
        return Math.max(widest, shortcut.length);
    }, 0);
    return longest > 0 ? Math.ceil(longest * charWidth) + 12 : 0;
}

function legacyWidth(entries: MenuEntry[], shortcuts: number): number {
    return Math.max(120, Math.ceil(longestLabel(entries) * LEGACY.charWidth) + 28 + 24 + shortcuts + 18);
}

function hasCheckbox(entries: MenuEntry[]): boolean {
    return entries.some((entry) => entry.kind === "item" && entry.checked !== undefined && !entry.radio);
}

function hasTrailingIcon(entries: MenuEntry[]): boolean {
    return entries.some((entry) => entry.kind === "submenu" || (entry.kind === "item" && !!entry.radio && entry.checked !== undefined));
}

function modernRowWidth(entry: MenuEntry, leading: number, trailing: number): number {
    if (entry.kind === "separator") return 0;
    const label = Math.ceil(entry.label.length * MODERN.charWidth);
    const shortcutText = entry.kind === "item" ? (entry.shortcut ?? "") : "";
    const shortcut = shortcutText ? Math.ceil(shortcutText.length * MODERN.shortcutCharWidth) + MODERN_GAP + MODERN_SHORTCUT_SPACE : 0;
    return label + leading + shortcut + trailing;
}

function modernWidth(entries: MenuEntry[], minWidth: number): number {
    const leading = hasCheckbox(entries) ? MODERN_MARK + MODERN_GAP : 0;
    const trailing = hasTrailingIcon(entries) ? MODERN_TRAILING_ICON + MODERN_GAP : 0;
    const widest = entries.reduce((max, entry) => Math.max(max, modernRowWidth(entry, leading, trailing)), 0);
    return Math.max(minWidth, widest + MODERN_ROW_PADDING + MODERN.frame * 2);
}

export function MenuPanel({ entries, x, y, alignRight, minWidth, path, onDone }: Props) {
    const { theme } = useApp();
    const colors = menuColors(theme);
    const tokens = theme.modern;
    const metrics = tokens ? MODERN : LEGACY;
    const screen = useWindowDimensions();
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const shortcuts = shortcutColumn(entries, metrics.shortcutCharWidth);
    const width = tokens ? modernWidth(entries, minWidth ?? MODERN_MIN_WIDTH) : legacyWidth(entries, shortcuts);
    const height = entries.reduce((sum, entry) => sum + entryHeight(entry, metrics), metrics.frame * 2);
    const preferredLeft = alignRight ? x - width : x;
    const left = Math.max(0, Math.min(preferredLeft, screen.width - width));
    const fitsBelow = y + height <= screen.height;
    const top = fitsBelow ? y : Math.max(0, screen.height - height);
    const openEntry = openIndex === null ? undefined : entries[openIndex];
    const openTop = openIndex === null ? 0 : entries.slice(0, openIndex).reduce((sum, entry) => sum + entryHeight(entry, metrics), 0);
    const leading = !!tokens && hasCheckbox(entries);
    const Frame = tokens ? FadeIn : View;
    const panelStyle = tokens
        ? {
              padding: 4,
              backgroundColor: tokens.bgRaised,
              borderWidth: 1,
              borderColor: tokens.lineStrong,
              borderRadius: 10,
              boxShadow: tokens.shadow,
          }
        : { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border };

    return (
        <>
            <Frame testID={path ? undefined : "popup-menu"} style={{ position: "absolute", left, top, width, ...panelStyle }}>
                {entries.map((entry, index) => {
                    if (entry.kind === "separator") {
                        if (tokens) {
                            return <View key={`separator-${index}`} style={{ height: 1, marginVertical: 4, marginHorizontal: 6, backgroundColor: tokens.lineSubtle }} />;
                        }
                        return (
                            <View key={`separator-${index}`} style={{ height: LEGACY.separatorHeight, paddingHorizontal: 5 }}>
                                <View style={{ height: 1, backgroundColor: colors.separator }} />
                            </View>
                        );
                    }
                    const select = () => {
                        if (entry.kind === "submenu") {
                            setOpenIndex(index);
                            return;
                        }
                        onDone();
                        entry.onSelect();
                    };
                    return (
                        <MenuRow
                            key={`${entry.label}-${index}`}
                            entry={entry}
                            testID={`menu-${path}${entry.label}`}
                            highlighted={openIndex === index}
                            shortcutWidth={shortcuts}
                            leading={leading}
                            onHover={() => setOpenIndex(entry.kind === "submenu" ? index : null)}
                            onPress={select}
                        />
                    );
                })}
            </Frame>
            {openEntry?.kind === "submenu" ? (
                <MenuPanel
                    entries={openEntry.entries}
                    x={left + width - metrics.submenuOverlap}
                    y={top + openTop}
                    path={`${path}${openEntry.label}/`}
                    onDone={onDone}
                />
            ) : null}
        </>
    );
}
