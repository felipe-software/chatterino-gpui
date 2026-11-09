import { TIMESTAMP_FORMATS } from "../../settings/generalHelpers";
import { SComboBox } from "../../settings/SComboBox";
import { useSettingsActions } from "../../settings/useSettingsActions";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { useApp } from "../../state/AppContext";
import { Button } from "../controls/Button";
import { Switch } from "../controls/Switch";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_ICONS } from "../icons";
import { SettingPathValue } from "../settings/SettingPathValue";
import { SettingRow } from "../settings/SettingRow";
import { SettingRowsCard } from "../settings/SettingRowsCard";
import { SettingsSection } from "../settings/SettingsSection";
import { SettingsSectionHeading } from "../settings/SettingsSectionHeading";
import { ChannelListEditor } from "./ChannelListEditor";

type Props = { logDirectory: string; unavailable: string };

const TIMESTAMP_TOOLTIP = "a = am/pm, zzz = milliseconds";
const TWITCH_TIME_TOOLTIP =
    "Uses the time Twitch's chat server received the message instead of your computer's clock. Timestamps can end up out of order, and messages without one fall back to your clock.";
const FORMATS = [{ value: "Disable", label: "No timestamps" }, ...TIMESTAMP_FORMATS.map((format) => ({ value: format, label: format }))];

export function ModerationLogsPanel({ logDirectory, unavailable }: Props) {
    const { settings } = useApp();
    const tokens = useModernTokens();
    const { update } = useSettingsUpdate();
    const actions = useSettingsActions();
    const loggingOff = !settings.enableLogging;
    return (
        <>
            <SettingRowsCard>
                <SettingRow label="Save chat logs" tooltip={unavailable}>
                    <Switch
                        testID="setting-enableLogging"
                        label="Save chat logs"
                        value={settings.enableLogging}
                        onChange={(enableLogging) => update({ enableLogging })}
                    />
                </SettingRow>
                <SettingRow label="Logs folder" hint="Plain text files, one per channel" stacked>
                    <SettingPathValue testID="logs-path" value={settings.logPath || logDirectory} />
                    <Button testID="logs-select" label="Change" onPress={() => actions.pickDirectory((logPath) => update({ logPath }))} />
                    <Button testID="logs-reset" label="Reset" disabled={!settings.logPath} onPress={() => update({ logPath: "" })} />
                </SettingRow>
                <SettingRow label="Timestamp format" tooltip={TIMESTAMP_TOOLTIP}>
                    <SComboBox
                        testID="setting-logTimestampFormat"
                        value={settings.logTimestampFormat}
                        options={FORMATS}
                        greyable={false}
                        onChange={(logTimestampFormat) => update({ logTimestampFormat })}
                    />
                </SettingRow>
                <SettingRow label="Use Twitch's timestamps" tooltip={TWITCH_TIME_TOOLTIP} disabled={loggingOff}>
                    <Switch
                        testID="setting-tryUseTwitchTimestamps"
                        label="Use Twitch's timestamps"
                        value={settings.tryUseTwitchTimestamps}
                        disabled={loggingOff}
                        onChange={(tryUseTwitchTimestamps) => update({ tryUseTwitchTimestamps })}
                    />
                </SettingRow>
                <SettingRow label="Only log the channels below" disabled={loggingOff}>
                    <Switch
                        testID="setting-onlyLogListedChannels"
                        label="Only log the channels below"
                        value={settings.onlyLogListedChannels}
                        disabled={loggingOff}
                        onChange={(onlyLogListedChannels) => update({ onlyLogListedChannels })}
                    />
                </SettingRow>
                <SettingRow label="Save live streams as separate files" disabled={loggingOff}>
                    <Switch
                        testID="setting-separatelyStoreStreamLogs"
                        label="Save live streams as separate files"
                        value={settings.separatelyStoreStreamLogs}
                        disabled={loggingOff}
                        onChange={(separatelyStoreStreamLogs) => update({ separatelyStoreStreamLogs })}
                    />
                </SettingRow>
            </SettingRowsCard>
            <SettingsSection tokens={tokens}>
                <SettingsSectionHeading title="Logged channels" description="Used when only the channels below are logged." />
                <ChannelListEditor
                    testID="logged-channel"
                    channels={settings.loggedChannels}
                    showStatus={false}
                    emptyIcon={MODERN_ICONS.channel}
                    emptyTitle="No channels listed"
                    emptyDescription="Every channel you open is logged until you add one here and turn on the option above."
                    onChange={(loggedChannels) => update({ loggedChannels })}
                />
            </SettingsSection>
        </>
    );
}
