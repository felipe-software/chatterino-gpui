import { Text } from "@felipe-software/react-native-gpui";
import type { HighlightUser } from "../../../data/api";
import { USER_BUILTINS, type UserRow } from "../../settings/highlightRows";
import { useSettingsActions } from "../../settings/useSettingsActions";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { useApp } from "../../state/AppContext";
import { IconButton } from "../controls/IconButton";
import { Swatch } from "../controls/Swatch";
import { Switch } from "../controls/Switch";
import { useModernTokens } from "../controls/useModernTokens";
import { DragHandle } from "./DragHandle";
import { EditableText } from "./EditableText";
import { FlagCell } from "./FlagCell";
import { swatchColor, toneColor } from "./highlightColors";
import { PAGE_ICONS } from "./pageIcons";
import { SettingsTable } from "./SettingsTable";
import { SoundFileButton } from "./SoundFileButton";
import { moveItem, removeAt, replaceAt, type ModernColumn } from "./tableModel";

type Props = { autoEdit: number | null; onAutoEditDone: () => void };

type UserFlag = "showInMentions" | "alert" | "playSound";

const METRICS = { gap: 10, paddingLeft: 12, paddingRight: 12, minRowHeight: 44 };
const FLAG_WIDTH = 64;

export function HighlightUsersTable({ autoEdit, onAutoEditDone }: Props) {
    const { settings, fonts } = useApp();
    const tokens = useModernTokens();
    const { update } = useSettingsUpdate();
    const actions = useSettingsActions();
    const users = settings.highlightUsers;
    const builtin = USER_BUILTINS[0];
    const offset = USER_BUILTINS.length;
    const rows: UserRow[] = [{ kind: "builtin", row: builtin }, ...users.map((user): UserRow => ({ kind: "user", user }))];
    const saveUsers = (highlightUsers: HighlightUser[]) => update({ highlightUsers });
    const setUser = (index: number, patch: Partial<HighlightUser>) => saveUsers(replaceAt(users, index - offset, patch));

    const flag = (key: UserFlag, title: string): ModernColumn<UserRow> => ({
        key,
        title,
        width: FLAG_WIDTH,
        render: (row, index, state) => {
            if (row.kind === "builtin") {
                const value = key === "showInMentions" ? settings.showSelfMessageHighlightInMentions : undefined;
                return (
                    <FlagCell
                        testID={`highlight-user-${key}-${index}`}
                        value={value}
                        onChange={(next) => update({ showSelfMessageHighlightInMentions: next })}
                    />
                );
            }
            const sound =
                key === "playSound" ? (
                    <SoundFileButton
                        testID={`highlight-user-sound-file-${index}`}
                        path={row.user.soundUrl}
                        visible={state.hovered}
                        onPress={() => actions.pickSound((soundUrl) => setUser(index, { soundUrl }))}
                    />
                ) : null;
            return (
                <FlagCell testID={`highlight-user-${key}-${index}`} value={row.user[key]} onChange={(next) => setUser(index, { [key]: next })}>
                    {sound}
                </FlagCell>
            );
        },
    });

    const columns: Array<ModernColumn<UserRow>> = [
        {
            key: "lead",
            width: 30,
            render: (row, index, state) =>
                row.kind === "user" ? (
                    <DragHandle state={state} testID={`highlight-user-grip-${index}`} />
                ) : (
                    <Switch
                        testID="highlight-user-enabled-self"
                        size="sm"
                        label={`Enable ${builtin.modernLabel}`}
                        value={settings.enableSelfMessageHighlight}
                        onChange={(enableSelfMessageHighlight) => update({ enableSelfMessageHighlight })}
                    />
                ),
        },
        {
            key: "color",
            width: 18,
            render: (row, index) => {
                const color = row.kind === "user" ? swatchColor(row.user.color) : toneColor(tokens, builtin.tone);
                const pick = () =>
                    row.kind === "user"
                        ? actions.pickColor(row.user.color, (next) => setUser(index, { color: next }))
                        : actions.pickColor(settings.selfMessageHighlightColor || builtin.fallbackColor, (next) => update({ selfMessageHighlightColor: next }));
                return <Swatch testID={`highlight-user-color-${index}`} color={color} onPress={pick} />;
            },
        },
        {
            key: "name",
            title: "Username",
            flex: 1,
            render: (row, index) => {
                if (row.kind === "user") {
                    return (
                        <EditableText
                            testID={`highlight-user-name-${index}`}
                            value={row.user.login}
                            monospace
                            autoEdit={autoEdit === index}
                            onDone={onAutoEditDone}
                            onCommit={(login) => setUser(index, { login: login.trim() })}
                        />
                    );
                }
                return (
                    <Text
                        numberOfLines={1}
                        style={{
                            color: tokens.text,
                            opacity: settings.enableSelfMessageHighlight ? 1 : 0.45,
                            fontFamily: fonts.uiFamily,
                            fontSize: 13,
                            lineHeight: 18,
                        }}
                    >
                        {builtin.modernLabel}
                    </Text>
                );
            },
        },
        flag("showInMentions", "Mentions"),
        flag("alert", "Flash"),
        flag("playSound", "Sound"),
        {
            key: "remove",
            width: 32,
            render: (row, index) =>
                row.kind === "user" ? (
                    <IconButton
                        testID={`highlight-user-remove-${index}`}
                        icon={PAGE_ICONS.trash}
                        iconSize={16}
                        tone="danger"
                        label={`Remove ${row.user.login}`}
                        onPress={() => saveUsers(removeAt(users, index - offset))}
                    />
                ) : null,
        },
    ];

    return (
        <SettingsTable
            testID="highlight-users"
            columns={columns}
            rows={rows}
            metrics={METRICS}
            reorder={{ first: offset, last: rows.length - 1, onMove: (from, to) => saveUsers(moveItem(users, from - offset, to - offset)) }}
        />
    );
}
