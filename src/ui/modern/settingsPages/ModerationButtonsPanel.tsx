import { Text, View } from "@felipe-software/react-native-gpui";
import type { ModerationAction } from "../../../data/api";
import { useSettingsActions } from "../../settings/useSettingsActions";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { useApp } from "../../state/AppContext";
import { Button } from "../controls/Button";
import { EmptyState } from "../controls/EmptyState";
import { IconButton } from "../controls/IconButton";
import { Note } from "../controls/Note";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_ICONS } from "../icons";
import { DragHandle } from "./DragHandle";
import { EditableText } from "./EditableText";
import { moderationActionLook } from "./moderationActionLook";
import { ModerationIconTile } from "./ModerationIconTile";
import { PAGE_ICONS } from "./pageIcons";
import { SettingsTable } from "./SettingsTable";
import { moveItem, removeAt, replaceAt, type ModernColumn } from "./tableModel";

type Props = { autoEdit: number | null; onAutoEditDone: () => void; onAdd: () => void };

const METRICS = { gap: 12, paddingLeft: 12, paddingRight: 12, minRowHeight: 48 };
const DESCRIPTION = "One-click actions shown next to every message while moderation mode is on.";
const HELP = "Use {user.name}, {channel.name} and {msg.id} in what a button sends.";
const HELP_URL = "https://wiki.chatterino.com/Moderation/#moderation-mode";

export function ModerationButtonsPanel({ autoEdit, onAutoEditDone, onAdd }: Props) {
    const { settings, fonts, openUrl } = useApp();
    const tokens = useModernTokens();
    const { update } = useSettingsUpdate();
    const actions = useSettingsActions();
    const list = settings.moderationActions;
    const save = (moderationActions: ModerationAction[]) => update({ moderationActions });
    const set = (index: number, patch: Partial<ModerationAction>) => save(replaceAt(list, index, patch));
    const addButton = <Button testID="moderation-actions-add" label="Add button" icon={MODERN_ICONS.plus} onPress={onAdd} />;

    const columns: Array<ModernColumn<ModerationAction>> = [
        { key: "grip", width: 20, render: (_row, index, state) => <DragHandle state={state} testID={`moderation-grip-${index}`} /> },
        {
            key: "icon",
            title: "Icon",
            width: 32,
            render: (row, index) => (
                <ModerationIconTile
                    testID={`moderation-icon-${index}`}
                    look={moderationActionLook(row, tokens)}
                    onPress={() => actions.pickImage((iconPath) => set(index, { iconPath }))}
                />
            ),
        },
        {
            key: "label",
            title: "Label",
            width: 110,
            render: (row) => (
                <Text numberOfLines={1} style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 14, lineHeight: 20, fontWeight: "500" }}>
                    {moderationActionLook(row, tokens).label}
                </Text>
            ),
        },
        {
            key: "action",
            title: "Sends",
            flex: 1,
            render: (row, index) => (
                <EditableText
                    testID={`moderation-action-${index}`}
                    value={row.action}
                    monospace
                    color={tokens.text2}
                    autoEdit={autoEdit === index}
                    onDone={onAutoEditDone}
                    onCommit={(action) => set(index, { action })}
                />
            ),
        },
        {
            key: "remove",
            width: 32,
            render: (row, index) => (
                <IconButton
                    testID={`moderation-remove-${index}`}
                    icon={PAGE_ICONS.trash}
                    iconSize={16}
                    tone="danger"
                    label={`Remove ${moderationActionLook(row, tokens).label}`}
                    onPress={() => save(removeAt(list, index))}
                />
            ),
        },
    ];

    return (
        <>
            <Text style={{ color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 }}>{DESCRIPTION}</Text>
            {list.length === 0 ? (
                <EmptyState
                    bordered
                    icon={PAGE_ICONS.shield}
                    title="No moderation buttons yet"
                    description="Buttons run a command, like /ban {user.name}, with one click."
                >
                    {addButton}
                </EmptyState>
            ) : (
                <SettingsTable
                    testID="moderation-actions"
                    columns={columns}
                    rows={list}
                    metrics={METRICS}
                    reorder={{ first: 0, last: list.length - 1, onMove: (from, to) => save(moveItem(list, from, to)) }}
                />
            )}
            {list.length === 0 ? null : <View style={{ alignSelf: "flex-start" }}>{addButton}</View>}
            <Note icon={PAGE_ICONS.info} text={HELP} link={{ label: "More about moderation mode", onPress: () => openUrl(HELP_URL) }} />
        </>
    );
}
