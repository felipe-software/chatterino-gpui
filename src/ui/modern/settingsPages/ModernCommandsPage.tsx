import { useState } from "react";
import type { CustomCommand } from "../../../data/api";
import { duplicateTriggers } from "../../../data/twitch/custom-commands";
import { useApp } from "../../state/AppContext";
import { useSettingsUi } from "../../settings/SettingsContext";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { Button } from "../controls/Button";
import { Callout } from "../controls/Callout";
import { EmptyState } from "../controls/EmptyState";
import { IconButton } from "../controls/IconButton";
import { Switch } from "../controls/Switch";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_ICONS } from "../icons";
import { CommandVariables } from "./CommandVariables";
import { DragHandle } from "./DragHandle";
import { EditableText } from "./EditableText";
import { PageHeader } from "./PageHeader";
import { PAGE_ICONS } from "./pageIcons";
import { SettingsPageFrame } from "./SettingsPageFrame";
import { SettingsTable } from "./SettingsTable";
import { hiddenRows, moveItem, removeAt, replaceAt, type ModernColumn } from "./tableModel";

const METRICS = { gap: 12, paddingLeft: 12, paddingRight: 12, minRowHeight: 48 };
const DUPLICATE_WARNING = "Two or more commands share a trigger. Only one of them will run.";
const NEW_COMMAND: CustomCommand = { trigger: "/command", command: "I made a new command HeyGuys", showInMessageMenu: false };

export function ModernCommandsPage() {
    const { settings } = useApp();
    const tokens = useModernTokens();
    const { query } = useSettingsUi();
    const { update } = useSettingsUpdate();
    const [added, setAdded] = useState<number | null>(null);
    const rows = settings.commands;
    const duplicates = duplicateTriggers(rows);
    const save = (commands: CustomCommand[]) => update({ commands });
    const set = (index: number, patch: Partial<CustomCommand>) => save(replaceAt(rows, index, patch));
    const add = () => {
        setAdded(rows.length);
        save([...rows, NEW_COMMAND]);
    };
    const addButton = <Button testID="commands-add" label="Add command" icon={MODERN_ICONS.plus} onPress={add} />;

    const columns: Array<ModernColumn<CustomCommand>> = [
        { key: "grip", width: 20, render: (_row, index, state) => <DragHandle state={state} testID={`command-grip-${index}`} /> },
        {
            key: "trigger",
            title: "Trigger",
            width: 120,
            render: (row, index) => (
                <EditableText
                    testID={`command-trigger-${index}`}
                    value={row.trigger}
                    monospace
                    weight="600"
                    color={duplicates.has(row.trigger) ? tokens.warn : undefined}
                    autoEdit={added === index}
                    onDone={() => setAdded(null)}
                    onCommit={(trigger) => set(index, { trigger: trigger.trim() })}
                />
            ),
        },
        {
            key: "command",
            title: "Sends",
            flex: 1,
            render: (row, index) => (
                <EditableText
                    testID={`command-text-${index}`}
                    value={row.command}
                    monospace
                    color={tokens.text2}
                    onCommit={(command) => set(index, { command: command.trim() })}
                />
            ),
        },
        {
            key: "menu",
            title: "In message menu",
            width: 96,
            render: (row, index) => (
                <Switch
                    testID={`command-menu-${index}`}
                    size="sm"
                    label={`Show ${row.trigger} in the message menu`}
                    value={row.showInMessageMenu}
                    onChange={(showInMessageMenu) => set(index, { showInMessageMenu })}
                />
            ),
        },
        {
            key: "remove",
            width: 32,
            render: (row, index) => (
                <IconButton
                    testID={`command-remove-${index}`}
                    icon={PAGE_ICONS.trash}
                    iconSize={16}
                    tone="danger"
                    label={`Remove ${row.trigger}`}
                    onPress={() => save(removeAt(rows, index))}
                />
            ),
        },
    ];

    return (
        <SettingsPageFrame testID="settings-commands" gap={24}>
            <PageHeader title="Commands" description="Type a short trigger, send something longer." actions={addButton} />
            {rows.length === 0 ? (
                <EmptyState
                    bordered
                    icon={PAGE_ICONS.command}
                    title="No commands yet"
                    description="Make a trigger like /so that sends a longer message or command for you."
                >
                    {addButton}
                </EmptyState>
            ) : (
                <SettingsTable
                    testID="commands-table"
                    columns={columns}
                    rows={rows}
                    metrics={METRICS}
                    hidden={hiddenRows(query, rows, (row) => [row.trigger, row.command])}
                    reorder={{ first: 0, last: rows.length - 1, onMove: (from, to) => save(moveItem(rows, from, to)) }}
                />
            )}
            {duplicates.size > 0 ? <Callout testID="commands-duplicates" tone="warning" title="Duplicate triggers" description={DUPLICATE_WARNING} /> : null}
            <CommandVariables />
        </SettingsPageFrame>
    );
}
