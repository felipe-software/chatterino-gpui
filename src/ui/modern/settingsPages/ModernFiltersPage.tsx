import { View } from "@felipe-software/react-native-gpui";
import type { FilterRecord } from "../../../data/api";
import { checkFilterText } from "../../../data/filters/lang/filter";
import { newFilterId } from "../../../data/filters/records";
import { useApp } from "../../state/AppContext";
import { FilterEditorContent } from "../../settings/FilterEditorContent";
import { useSettingsUi } from "../../settings/SettingsContext";
import { useSettingsActions } from "../../settings/useSettingsActions";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { Button } from "../controls/Button";
import { EmptyState } from "../controls/EmptyState";
import { IconButton } from "../controls/IconButton";
import { Note } from "../controls/Note";
import { Switch } from "../controls/Switch";
import { useModernTokens } from "../controls/useModernTokens";
import { withAlpha } from "../../colors";
import { MODERN_ICONS } from "../icons";
import { SettingRow } from "../settings/SettingRow";
import { SettingRowsCard } from "../settings/SettingRowsCard";
import { DragHandle } from "./DragHandle";
import { EditableText } from "./EditableText";
import { FilterCell } from "./FilterCell";
import { PageHeader } from "./PageHeader";
import { PAGE_ICONS } from "./pageIcons";
import { SettingsPageFrame } from "./SettingsPageFrame";
import { SettingsTable } from "./SettingsTable";
import { hiddenRows, moveItem, removeAt, replaceAt, type ModernColumn } from "./tableModel";

const METRICS = { gap: 16, paddingLeft: 12, paddingRight: 16, minRowHeight: 0, rowPaddingVertical: 12, alignItems: "flex-start" as const };
const SYNTAX_URL = "https://wiki.chatterino.com/Filters";

export function ModernFiltersPage() {
    const { settings, openUrl } = useApp();
    const tokens = useModernTokens();
    const ui = useSettingsUi();
    const { update } = useSettingsUpdate();
    const actions = useSettingsActions();
    const rows = settings.filters;
    const checks = rows.map((row) => checkFilterText(row.filter));
    const save = (filters: FilterRecord[]) => update({ filters });
    const set = (index: number, patch: Partial<FilterRecord>) => save(replaceAt(rows, index, patch));

    const add = () =>
        ui.openPopup({
            kind: "modal",
            title: "New filter",
            width: 560,
            height: 440,
            render: (close) => (
                <FilterEditorContent
                    onAccept={(name, filter) => {
                        save([...rows, { id: newFilterId(), name, filter }]);
                        close();
                    }}
                    onCancel={close}
                />
            ),
        });
    const showErrors = (index: number) => actions.message("Invalid filter", "warning", checks[index].message, checks[index].detail);
    const addButton = <Button testID="filters-add" label="Add filter" icon={MODERN_ICONS.plus} onPress={add} />;

    const columns: Array<ModernColumn<FilterRecord>> = [
        {
            key: "grip",
            width: 20,
            render: (_row, index, state) => (
                <View style={{ height: 20, justifyContent: "center" }}>
                    <DragHandle state={state} testID={`filter-grip-${index}`} />
                </View>
            ),
        },
        {
            key: "name",
            title: "Name",
            width: 160,
            render: (row, index) => (
                <EditableText testID={`filter-name-${index}`} value={row.name} fontSize={14} weight="500" multiline onCommit={(name) => set(index, { name })} />
            ),
        },
        {
            key: "filter",
            title: "Expression",
            flex: 1,
            render: (row, index) => (
                <FilterCell
                    testID={`filter-${index}`}
                    filter={row.filter}
                    check={checks[index]}
                    onCommit={(filter) => set(index, { filter })}
                    onShowErrors={() => showErrors(index)}
                />
            ),
        },
        {
            key: "remove",
            width: 32,
            render: (row, index) => (
                <View style={{ marginTop: -6 }}>
                    <IconButton
                        testID={`filter-remove-${index}`}
                        icon={PAGE_ICONS.trash}
                        iconSize={16}
                        tone="danger"
                        label={`Remove ${row.name}`}
                        onPress={() => save(removeAt(rows, index))}
                    />
                </View>
            ),
        },
    ];

    return (
        <SettingsPageFrame testID="settings-filters" gap={24}>
            <PageHeader title="Filters" description="Show only the messages that match. Turn a filter on for a split from its menu." actions={addButton} />
            {rows.length === 0 ? (
                <EmptyState
                    bordered
                    icon={PAGE_ICONS.filter}
                    title="No filters yet"
                    description="A filter keeps only the messages that match an expression, like author.subbed."
                >
                    {addButton}
                </EmptyState>
            ) : (
                <SettingsTable
                    testID="filters-table"
                    columns={columns}
                    rows={rows}
                    metrics={METRICS}
                    hidden={hiddenRows(ui.query, rows, (row) => [row.name, row.filter])}
                    reorder={{ first: 0, last: rows.length - 1, onMove: (from, to) => save(moveItem(rows, from, to)) }}
                    rowTint={(_row, index) => (checks[index].valid ? undefined : withAlpha(tokens.dangerTint, 0.5))}
                />
            )}
            <SettingRowsCard>
                <SettingRow label="Don't filter my own messages">
                    <Switch
                        testID="setting-excludeUserMessagesFromFilter"
                        label="Don't filter my own messages"
                        value={settings.excludeUserMessagesFromFilter}
                        onChange={(excludeUserMessagesFromFilter) => update({ excludeUserMessagesFromFilter })}
                    />
                </SettingRow>
            </SettingRowsCard>
            <Note
                icon={PAGE_ICONS.info}
                text="Expressions are checked as you type."
                link={{ label: "Filter syntax and variables", onPress: () => openUrl(SYNTAX_URL) }}
            />
        </SettingsPageFrame>
    );
}
