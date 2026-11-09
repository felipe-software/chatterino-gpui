import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";
import { SettingsCard } from "../settings/SettingsCard";
import { SettingsTableRow } from "./SettingsTableRow";
import { columnBox, type ModernColumn, type RowReorder, type TableMetrics } from "./tableModel";
import { useRowDrag } from "./useRowDrag";

type Props<T> = {
    testID: string;
    columns: Array<ModernColumn<T>>;
    rows: T[];
    metrics: TableMetrics;
    showHeader?: boolean;
    hidden?: Set<number>;
    reorder?: RowReorder;
    rowTint?: (row: T, index: number) => string | undefined;
};

export function SettingsTable<T>({ testID, columns, rows, metrics, showHeader = true, hidden, reorder, rowTint }: Props<T>) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const filtering = !!hidden && hidden.size > 0;
    const activeReorder = filtering ? undefined : reorder;
    const { drag, binding, measure, order } = useRowDrag(activeReorder);
    const visible = order(rows.length).filter((index) => !hidden?.has(index));
    return (
        <SettingsCard tokens={tokens}>
            <View testID={testID}>
                {showHeader ? (
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: metrics.gap,
                            paddingVertical: 10,
                            paddingLeft: metrics.paddingLeft,
                            paddingRight: metrics.paddingRight,
                            borderBottomWidth: 1,
                            borderBottomColor: tokens.lineSubtle,
                        }}
                    >
                        {columns.map((column) => (
                            <View key={column.key} style={columnBox(column)}>
                                <View style={{ width: column.width === undefined ? undefined : column.width + metrics.gap }}>
                                    <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16, fontWeight: "500" }}>
                                        {column.title ?? ""}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : null}
                {visible.map((index, position) => {
                    const dragging = drag?.from === index;
                    return (
                        <SettingsTableRow
                            key={index}
                            testID={`${testID}-row-${index}`}
                            row={rows[index]}
                            index={index}
                            columns={columns}
                            metrics={metrics}
                            first={position === 0}
                            tint={rowTint?.(rows[index], index)}
                            drag={binding(index)}
                            dragging={dragging}
                            offset={dragging ? (drag?.offset ?? 0) : 0}
                            onLayout={measure(index)}
                        />
                    );
                })}
            </View>
        </SettingsCard>
    );
}
