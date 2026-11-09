import { useState } from "react";
import { View, type LayoutChangeEvent, type ViewStyle } from "@felipe-software/react-native-gpui";
import { HoverLayer } from "../controls/HoverLayer";
import { useModernTokens } from "../controls/useModernTokens";
import type { ModernTokens } from "../tokens";
import { columnBox, type DragBinding, type ModernColumn, type TableMetrics } from "./tableModel";

type Props<T> = {
    testID: string;
    row: T;
    index: number;
    columns: Array<ModernColumn<T>>;
    metrics: TableMetrics;
    first: boolean;
    tint?: string;
    drag?: DragBinding;
    dragging: boolean;
    offset: number;
    onLayout: (event: LayoutChangeEvent) => void;
};

function frameStyle(tokens: ModernTokens, first: boolean, dragging: boolean): ViewStyle {
    if (dragging) {
        return { borderWidth: 1, borderColor: tokens.accent, borderRadius: 8, boxShadow: tokens.shadow, zIndex: 2 };
    }
    if (first) return {};
    return { borderTopWidth: 1, borderTopColor: tokens.lineSubtle };
}

export function SettingsTableRow<T>({ testID, row, index, columns, metrics, first, tint, drag, dragging, offset, onLayout }: Props<T>) {
    const tokens = useModernTokens();
    const [hovered, setHovered] = useState(false);
    const background = dragging ? tokens.bgRaised : tint;
    const state = { hovered: hovered || dragging, dragging, drag };
    return (
        <View
            testID={testID}
            style={{
                ...frameStyle(tokens, first, dragging),
                position: "relative",
                top: offset,
                flexDirection: "row",
                alignItems: metrics.alignItems ?? "center",
                gap: metrics.gap,
                minHeight: first ? metrics.minRowHeight : metrics.minRowHeight + 1,
                paddingLeft: metrics.paddingLeft,
                paddingRight: metrics.paddingRight,
                paddingVertical: metrics.rowPaddingVertical ?? 0,
                backgroundColor: background,
            }}
            onLayout={onLayout}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <HoverLayer hovered={hovered && !dragging} radius={0} color={tokens.bgHover} />
            {columns.map((column) => (
                <View key={column.key} style={{ ...columnBox(column), justifyContent: "center" }}>
                    {column.render(row, index, state)}
                </View>
            ))}
        </View>
    );
}
