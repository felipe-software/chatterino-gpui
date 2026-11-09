import type { BlacklistedUser } from "../../../data/api";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { useApp } from "../../state/AppContext";
import { Checkbox } from "../controls/Checkbox";
import { IconButton } from "../controls/IconButton";
import { EditableText } from "./EditableText";
import { PAGE_ICONS } from "./pageIcons";
import { SettingsTable } from "./SettingsTable";
import { removeAt, replaceAt, type ModernColumn } from "./tableModel";

type Props = { autoEdit: number | null; onAutoEditDone: () => void };

const METRICS = { gap: 10, paddingLeft: 16, paddingRight: 16, minRowHeight: 44 };

export function HighlightBlockedTable({ autoEdit, onAutoEditDone }: Props) {
    const { settings } = useApp();
    const { update } = useSettingsUpdate();
    const rows = settings.blacklistedUsers;
    const save = (blacklistedUsers: BlacklistedUser[]) => update({ blacklistedUsers });
    const set = (index: number, patch: Partial<BlacklistedUser>) => save(replaceAt(rows, index, patch));

    const columns: Array<ModernColumn<BlacklistedUser>> = [
        {
            key: "pattern",
            title: "Username",
            flex: 1,
            render: (row, index) => (
                <EditableText
                    testID={`highlight-blocked-name-${index}`}
                    value={row.pattern}
                    monospace
                    autoEdit={autoEdit === index}
                    onDone={onAutoEditDone}
                    onCommit={(pattern) => set(index, { pattern: pattern.trim() })}
                />
            ),
        },
        {
            key: "regex",
            title: "Regex",
            width: 64,
            render: (row, index) => (
                <Checkbox testID={`highlight-blocked-regex-${index}`} checked={row.isRegex} onChange={(isRegex) => set(index, { isRegex })} />
            ),
        },
        {
            key: "remove",
            width: 32,
            render: (row, index) => (
                <IconButton
                    testID={`highlight-blocked-remove-${index}`}
                    icon={PAGE_ICONS.trash}
                    iconSize={16}
                    tone="danger"
                    label={`Remove ${row.pattern}`}
                    onPress={() => save(removeAt(rows, index))}
                />
            ),
        },
    ];

    return <SettingsTable testID="highlight-blacklist" columns={columns} rows={rows} metrics={METRICS} />;
}
