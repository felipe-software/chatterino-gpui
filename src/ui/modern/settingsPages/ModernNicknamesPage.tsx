import { useState } from "react";
import type { Nickname } from "../../../data/api";
import { useApp } from "../../state/AppContext";
import { useSettingsUi } from "../../settings/SettingsContext";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { Button } from "../controls/Button";
import { Checkbox } from "../controls/Checkbox";
import { EmptyState } from "../controls/EmptyState";
import { IconButton } from "../controls/IconButton";
import { Note } from "../controls/Note";
import { MODERN_ICONS } from "../icons";
import { DragHandle } from "./DragHandle";
import { EditableText } from "./EditableText";
import { PageHeader } from "./PageHeader";
import { PAGE_ICONS } from "./pageIcons";
import { SettingsPageFrame } from "./SettingsPageFrame";
import { SettingsTable } from "./SettingsTable";
import { hiddenRows, moveItem, removeAt, replaceAt, type ModernColumn } from "./tableModel";

const NOTE = "Highlights and filters still match the original username. Drag rows to change which nickname wins when two match.";
const METRICS = { gap: 12, paddingLeft: 12, paddingRight: 12, minRowHeight: 48 };

export function ModernNicknamesPage() {
    const { settings } = useApp();
    const { query } = useSettingsUi();
    const { update } = useSettingsUpdate();
    const [added, setAdded] = useState<number | null>(null);
    const rows = settings.nicknames;
    const save = (nicknames: Nickname[]) => update({ nicknames });
    const set = (index: number, patch: Partial<Nickname>) => save(replaceAt(rows, index, patch));

    const add = () => {
        setAdded(rows.length);
        save([...rows, { name: "Username", replace: "Nickname", isRegex: false, caseSensitive: false }]);
    };

    const addButton = <Button testID="nicknames-add" label="Add nickname" icon={MODERN_ICONS.plus} onPress={add} />;

    const columns: Array<ModernColumn<Nickname>> = [
        { key: "grip", width: 20, render: (_row, index, state) => <DragHandle state={state} testID={`nickname-grip-${index}`} /> },
        {
            key: "name",
            title: "Username",
            flex: 1.3,
            render: (row, index) => (
                <EditableText
                    testID={`nickname-name-${index}`}
                    value={row.name}
                    monospace
                    autoEdit={added === index}
                    onDone={() => setAdded(null)}
                    onCommit={(name) => set(index, { name: name.trim() })}
                />
            ),
        },
        {
            key: "replace",
            title: "Shown as",
            flex: 1,
            render: (row, index) => (
                <EditableText
                    testID={`nickname-replace-${index}`}
                    value={row.replace}
                    fontSize={14}
                    weight="600"
                    onCommit={(replace) => set(index, { replace })}
                />
            ),
        },
        {
            key: "regex",
            title: "Regex",
            width: 72,
            render: (row, index) => <Checkbox testID={`nickname-regex-${index}`} checked={row.isRegex} onChange={(isRegex) => set(index, { isRegex })} />,
        },
        {
            key: "case",
            title: "Match case",
            width: 92,
            render: (row, index) => (
                <Checkbox testID={`nickname-case-${index}`} checked={row.caseSensitive} onChange={(caseSensitive) => set(index, { caseSensitive })} />
            ),
        },
        {
            key: "remove",
            width: 32,
            render: (row, index) => (
                <IconButton
                    testID={`nickname-remove-${index}`}
                    icon={PAGE_ICONS.trash}
                    iconSize={16}
                    tone="danger"
                    label={`Remove nickname for ${row.name}`}
                    onPress={() => save(removeAt(rows, index))}
                />
            ),
        },
    ];

    return (
        <SettingsPageFrame testID="settings-nicknames" gap={24}>
            <PageHeader title="Nicknames" description="Show your own name for someone everywhere in chat." actions={addButton} />
            {rows.length === 0 ? (
                <EmptyState bordered icon={PAGE_ICONS.tag} title="No nicknames yet" description="Give someone a name that only you see, everywhere in chat.">
                    {addButton}
                </EmptyState>
            ) : null}
            {rows.length === 0 ? null : (
                <SettingsTable
                    testID="nicknames-table"
                    columns={columns}
                    rows={rows}
                    metrics={METRICS}
                    hidden={hiddenRows(query, rows, (row) => [row.name, row.replace])}
                    reorder={{ first: 0, last: rows.length - 1, onMove: (from, to) => save(moveItem(rows, from, to)) }}
                />
            )}
            <Note icon={PAGE_ICONS.info} text={NOTE} />
        </SettingsPageFrame>
    );
}
