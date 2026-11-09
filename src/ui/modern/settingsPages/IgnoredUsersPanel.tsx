import { Text } from "@felipe-software/react-native-gpui";
import type { BlockedUsersVisibility } from "../../../data/api";
import { SComboBox } from "../../settings/SComboBox";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { useApp } from "../../state/AppContext";
import { useStore } from "../../state/useStore";
import { EmptyState } from "../controls/EmptyState";
import { IconButton } from "../controls/IconButton";
import { Switch } from "../controls/Switch";
import { Tag } from "../controls/Tag";
import { MONO_FONT } from "../controls/typography";
import { useModernTokens } from "../controls/useModernTokens";
import { SettingRow } from "../settings/SettingRow";
import { SettingRowsCard } from "../settings/SettingRowsCard";
import { EditableText } from "./EditableText";
import { PAGE_ICONS } from "./pageIcons";
import { SettingsTable } from "./SettingsTable";
import type { ModernColumn } from "./tableModel";

type Props = { adding: boolean; onAddDone: () => void };

type UserRow = { login: string; twitch: boolean; pending: boolean };

const METRICS = { gap: 12, paddingLeft: 16, paddingRight: 16, minRowHeight: 48 };
const TWITCH_NAME = /^[a-z0-9_]{1,25}$/i;
const VISIBILITY = [
    { value: "never", label: "Never" },
    { value: "moderator", label: "If you moderate the channel" },
    { value: "broadcaster", label: "In your own channel" },
];

export function IgnoredUsersPanel({ adding, onAddDone }: Props) {
    const { core, settings } = useApp();
    const tokens = useModernTokens();
    const { update } = useSettingsUpdate();
    const twitchBlocks = useStore(core.blockedUsers);
    const logins = [...new Set([...twitchBlocks, ...settings.ignoredUsers])].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    const listed: UserRow[] = logins.map((login) => ({ login, twitch: twitchBlocks.includes(login), pending: false }));
    const rows = adding ? [...listed, { login: "", twitch: false, pending: true }] : listed;

    const columns: Array<ModernColumn<UserRow>> = [
        {
            key: "login",
            title: "Username",
            flex: 1,
            render: (row, index) =>
                row.pending ? (
                    <EditableText
                        testID="ignored-user-new"
                        value=""
                        placeholder="username"
                        monospace
                        autoEdit
                        validate={(value) => TWITCH_NAME.test(value.trim())}
                        onDone={onAddDone}
                        onCommit={(login) => void core.blockUser(login.trim())}
                    />
                ) : (
                    <Text
                        testID={`ignored-user-${index}`}
                        numberOfLines={1}
                        style={{ color: tokens.text, fontFamily: MONO_FONT, fontSize: 13, lineHeight: 18 }}
                    >
                        {row.login}
                    </Text>
                ),
        },
        { key: "source", width: 64, render: (row) => (row.twitch ? <Tag label="Twitch" tone="neutral" /> : null) },
        {
            key: "remove",
            width: 32,
            render: (row, index) =>
                row.pending ? null : (
                    <IconButton
                        testID={`ignored-user-remove-${index}`}
                        icon={PAGE_ICONS.trash}
                        iconSize={16}
                        tone="danger"
                        label={`Unblock ${row.login}`}
                        onPress={() => void core.unblockUser(row.login)}
                    />
                ),
        },
    ];

    return (
        <>
            <SettingRowsCard>
                <SettingRow label="Also ignore everyone you blocked on Twitch">
                    <Switch
                        testID="setting-enableTwitchBlockedUsers"
                        label="Also ignore everyone you blocked on Twitch"
                        value={settings.enableTwitchBlockedUsers}
                        onChange={(enableTwitchBlockedUsers) => update({ enableTwitchBlockedUsers })}
                    />
                </SettingRow>
                <SettingRow label="Still show their messages">
                    <SComboBox
                        testID="setting-showBlockedUsersMessages"
                        value={settings.showBlockedUsersMessages}
                        options={VISIBILITY}
                        greyable={false}
                        onChange={(value) => update({ showBlockedUsersMessages: value as BlockedUsersVisibility })}
                    />
                </SettingRow>
            </SettingRowsCard>
            {rows.length === 0 ? (
                <EmptyState
                    bordered
                    icon={PAGE_ICONS.eyeOff}
                    title="Nobody ignored yet"
                    description="Messages from people you add here never show up in chat."
                />
            ) : (
                <SettingsTable testID="ignored-users" columns={columns} rows={rows} metrics={METRICS} />
            )}
        </>
    );
}
