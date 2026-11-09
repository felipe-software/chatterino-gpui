import { Text, View } from "@felipe-software/react-native-gpui";
import type { TimeoutButton, TimeoutUnit } from "../../../data/api";
import { clampTimeout } from "../../settings/TimeoutButtonsTab";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { useApp } from "../../state/AppContext";
import { Button } from "../controls/Button";
import { SegmentedControl } from "../controls/SegmentedControl";
import { TextField } from "../controls/TextField";
import { useModernTokens } from "../controls/useModernTokens";
import { SettingsCard } from "../settings/SettingsCard";
import { DragHandle } from "./DragHandle";
import { SettingsTable } from "./SettingsTable";
import { moveItem, replaceAt, type ModernColumn } from "./tableModel";

const UNITS: Array<{ value: TimeoutUnit; label: string }> = [
    { value: "s", label: "s" },
    { value: "m", label: "m" },
    { value: "h", label: "h" },
    { value: "d", label: "d" },
    { value: "w", label: "w" },
];
const METRICS = { gap: 14, paddingLeft: 12, paddingRight: 16, minRowHeight: 48 };
const DESCRIPTION = "These appear in the user card when you click a name. Up to 2 weeks each.";

export function TimeoutButtonsPanel() {
    const { settings, fonts } = useApp();
    const tokens = useModernTokens();
    const { update } = useSettingsUpdate();
    const buttons = settings.timeoutButtons;
    const save = (timeoutButtons: TimeoutButton[]) => update({ timeoutButtons });
    const set = (index: number, next: TimeoutButton) => save(replaceAt(buttons, index, next));
    const textStyle = { fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 };

    const columns: Array<ModernColumn<TimeoutButton>> = [
        { key: "grip", width: 20, render: (_row, index, state) => <DragHandle state={state} testID={`timeout-grip-${index}`} /> },
        {
            key: "name",
            flex: 1,
            render: (_row, index) => (
                <Text style={{ ...textStyle, color: tokens.text, fontSize: 14, lineHeight: 20, fontWeight: "500" }}>{`Button ${index + 1}`}</Text>
            ),
        },
        {
            key: "value",
            width: 64,
            render: (row, index) => (
                <TextField
                    testID={`timeout-value-${index}`}
                    size="md"
                    align="right"
                    accessibilityLabel={`Button ${index + 1} amount`}
                    value={String(row.value)}
                    onChange={(text) => {
                        const parsed = Number.parseInt(text, 10);
                        if (Number.isFinite(parsed)) set(index, { unit: row.unit, value: clampTimeout(row.unit, parsed) });
                    }}
                />
            ),
        },
        {
            key: "unit",
            width: 150,
            render: (row, index) => (
                <SegmentedControl
                    testID={`timeout-unit-${index}`}
                    options={UNITS}
                    value={row.unit}
                    onChange={(unit) => set(index, { unit, value: clampTimeout(unit, row.value) })}
                />
            ),
        },
    ];

    return (
        <>
            <Text style={{ ...textStyle, color: tokens.text2 }}>{DESCRIPTION}</Text>
            <SettingsCard tokens={tokens}>
                <View style={{ gap: 8, paddingVertical: 14, paddingHorizontal: 16 }}>
                    <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16, fontWeight: "500" }}>Preview</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                        {buttons.map((button, index) => (
                            <Button
                                key={index}
                                testID={`timeout-preview-${index}`}
                                label={`${button.value}${button.unit}`}
                                size="sm"
                                onPress={() => undefined}
                            />
                        ))}
                    </View>
                </View>
            </SettingsCard>
            <SettingsTable
                testID="timeout-buttons"
                columns={columns}
                rows={buttons}
                metrics={METRICS}
                showHeader={false}
                reorder={{ first: 0, last: buttons.length - 1, onMove: (from, to) => save(moveItem(buttons, from, to)) }}
            />
        </>
    );
}
