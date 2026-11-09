import { useMemo, useState } from "react";
import { ScrollView, Text, View, type LayoutChangeEvent } from "@felipe-software/react-native-gpui";
import type { EmoteInfo } from "../../../data/api";
import { layoutTileGrid, TILE_GRID, visibleRows, type TileRow } from "../../overlays/emoteGridLayout";
import type { EmoteSection } from "../../overlays/emoteSections";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";
import { emoteKey } from "./emoteImage";
import { EmoteSectionHeader } from "./EmoteSectionHeader";
import { EmoteTile } from "./EmoteTile";

type Props = {
    testID: string;
    sections: EmoteSection[];
    note?: string;
    selectedKey?: string;
    onHover: (emote: EmoteInfo) => void;
    onPick: (emote: EmoteInfo, keepOpen: boolean) => void;
};

type ScrollEvent = { nativeEvent?: { contentOffset?: { y?: number } } };

export function EmoteTileGrid({ testID, sections, note, selectedKey, onHover, onPick }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [scrollTop, setScrollTop] = useState(0);
    const layout = useMemo(() => layoutTileGrid(sections, size.width, note), [sections, size.width, note]);
    const rows = size.width > 0 ? visibleRows(layout, scrollTop, size.height) : [];

    const handleLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        if (width !== size.width || height !== size.height) setSize({ width, height });
    };

    const handleScroll = (event: unknown) => setScrollTop((event as ScrollEvent).nativeEvent?.contentOffset?.y ?? 0);

    const renderRow = (row: TileRow) => {
        const frame = { position: "absolute" as const, left: 0, top: row.y, width: size.width, height: row.height };
        if (row.kind === "header") {
            return (
                <View key={row.key} style={{ ...frame, paddingHorizontal: TILE_GRID.paddingX }}>
                    <EmoteSectionHeader title={row.title} count={row.count} />
                </View>
            );
        }
        if (row.kind === "note") {
            return (
                <View key={row.key} style={{ ...frame, paddingHorizontal: TILE_GRID.paddingX + 4 }}>
                    <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>{row.text}</Text>
                </View>
            );
        }
        return (
            <View key={row.key} style={frame}>
                {row.items.map((item) => (
                    <EmoteTile
                        key={emoteKey(item.emote)}
                        emote={item.emote}
                        x={item.x}
                        size={layout.tile}
                        selected={emoteKey(item.emote) === selectedKey}
                        onHover={onHover}
                        onPick={onPick}
                    />
                ))}
            </View>
        );
    };

    return (
        <View testID={testID} style={{ flex: 1 }} onLayout={handleLayout}>
            <ScrollView style={{ flex: 1 }} onScroll={handleScroll} contentContainerStyle={{ height: layout.height }}>
                {rows.map(renderRow)}
            </ScrollView>
        </View>
    );
}
