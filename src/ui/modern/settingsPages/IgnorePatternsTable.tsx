import type { IgnoredPhrase } from "../../../data/api";
import { useSettingsUi } from "../../settings/SettingsContext";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { useApp } from "../../state/AppContext";
import { Checkbox } from "../controls/Checkbox";
import { IconButton } from "../controls/IconButton";
import { DragHandle } from "./DragHandle";
import { EditableText } from "./EditableText";
import { IgnoreActionCell } from "./IgnoreActionCell";
import { PAGE_ICONS } from "./pageIcons";
import { SettingsTable } from "./SettingsTable";
import { hiddenRows, moveItem, removeAt, replaceAt, type ModernColumn } from "./tableModel";

type Props = { autoEdit: number | null; onAutoEditDone: () => void };

const METRICS = { gap: 12, paddingLeft: 12, paddingRight: 16, minRowHeight: 48 };

export function IgnorePatternsTable({ autoEdit, onAutoEditDone }: Props) {
    const { settings } = useApp();
    const { query } = useSettingsUi();
    const { update } = useSettingsUpdate();
    const rows = settings.ignoredPhrases;
    const save = (ignoredPhrases: IgnoredPhrase[]) => update({ ignoredPhrases });
    const set = (index: number, patch: Partial<IgnoredPhrase>) => save(replaceAt(rows, index, patch));

    const columns: Array<ModernColumn<IgnoredPhrase>> = [
        { key: "grip", width: 20, render: (_row, index, state) => <DragHandle state={state} testID={`ignore-grip-${index}`} /> },
        {
            key: "pattern",
            title: "Pattern",
            flex: 1,
            render: (row, index) => (
                <EditableText
                    testID={`ignore-pattern-${index}`}
                    value={row.pattern}
                    monospace
                    autoEdit={autoEdit === index}
                    onDone={onAutoEditDone}
                    onCommit={(pattern) => set(index, { pattern })}
                />
            ),
        },
        {
            key: "regex",
            title: "Regex",
            width: 52,
            render: (row, index) => <Checkbox testID={`ignore-regex-${index}`} checked={row.isRegex} onChange={(isRegex) => set(index, { isRegex })} />,
        },
        {
            key: "case",
            title: "Case",
            width: 52,
            render: (row, index) => (
                <Checkbox testID={`ignore-case-${index}`} checked={row.caseSensitive} onChange={(caseSensitive) => set(index, { caseSensitive })} />
            ),
        },
        {
            key: "then",
            title: "Then",
            flex: 1,
            render: (row, index) => <IgnoreActionCell testID={`ignore-then-${index}`} phrase={row} onChange={(patch) => set(index, patch)} />,
        },
        {
            key: "remove",
            width: 32,
            render: (row, index) => (
                <IconButton
                    testID={`ignore-remove-${index}`}
                    icon={PAGE_ICONS.trash}
                    iconSize={16}
                    tone="danger"
                    label={`Remove ${row.pattern}`}
                    onPress={() => save(removeAt(rows, index))}
                />
            ),
        },
    ];

    return (
        <SettingsTable
            testID="ignore-phrases"
            columns={columns}
            rows={rows}
            metrics={METRICS}
            hidden={hiddenRows(query, rows, (row) => [row.pattern, row.replaceWith])}
            reorder={{ first: 0, last: rows.length - 1, onMove: (from, to) => save(moveItem(rows, from, to)) }}
        />
    );
}
