import { Platform } from "@felipe-software/react-native-gpui";
import { fileName } from "../../settings/highlightRows";
import { useSettingsActions } from "../../settings/useSettingsActions";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { useApp } from "../../state/AppContext";
import { Button } from "../controls/Button";
import { SegmentedControl } from "../controls/SegmentedControl";
import { Switch } from "../controls/Switch";
import { useModernTokens } from "../controls/useModernTokens";
import { SettingPathValue } from "../settings/SettingPathValue";
import { SettingRow } from "../settings/SettingRow";
import { SettingRowsCard } from "../settings/SettingRowsCard";
import { SettingsSection } from "../settings/SettingsSection";
import { SettingsSectionHeading } from "../settings/SettingsSectionHeading";
import { ChannelListEditor } from "./ChannelListEditor";
import { PageHeader } from "./PageHeader";
import { PAGE_ICONS } from "./pageIcons";
import { SettingsPageFrame } from "./SettingsPageFrame";

type SoundMode = "off" | "selected" | "any";

const FLASH_NOTE = "Not available in this app: the taskbar can only be flashed on macOS.";
const SOUND_MODES: Array<{ value: SoundMode; label: string }> = [
    { value: "off", label: "Off" },
    { value: "selected", label: "Selected channels" },
    { value: "any", label: "Any channel" },
];

function soundModeOf(anyChannel: boolean, selectedChannels: boolean): SoundMode {
    if (anyChannel) return "any";
    if (selectedChannels) return "selected";
    return "off";
}

export function ModernNotificationsPage() {
    const { core, settings } = useApp();
    const tokens = useModernTokens();
    const { update } = useSettingsUpdate();
    const actions = useSettingsActions();
    const channels = settings.notificationChannels;
    const soundMode = soundModeOf(settings.notificationOnAnyChannel, settings.notificationPlaySound);
    const soundFile = fileName(settings.notificationPathSound);

    const setSoundMode = (mode: SoundMode) => {
        if (mode === "off") update({ notificationPlaySound: false, notificationOnAnyChannel: false });
        if (mode === "selected") update({ notificationPlaySound: true, notificationOnAnyChannel: false });
        if (mode === "any") update({ notificationPlaySound: true, notificationOnAnyChannel: true });
    };
    const play = () => core.playSound(settings.notificationCustomSound && settings.notificationPathSound ? settings.notificationPathSound : undefined);

    return (
        <SettingsPageFrame testID="settings-notifications" gap={32}>
            <PageHeader title="Live notifications" description="Find out when the channels you care about go live." />
            <SettingsSection tokens={tokens} title="When a channel goes live">
                <SettingRowsCard>
                    <SettingRow label="Show a desktop notification">
                        <Switch
                            testID="setting-liveNotifications"
                            label="Show a desktop notification"
                            value={settings.liveNotifications}
                            onChange={(liveNotifications) => update({ liveNotifications })}
                        />
                    </SettingRow>
                    <SettingRow label="Flash the taskbar" tooltip={Platform.OS === "macos" ? undefined : FLASH_NOTE}>
                        <Switch
                            testID="setting-notificationFlashTaskbar"
                            label="Flash the taskbar"
                            value={settings.notificationFlashTaskbar}
                            onChange={(notificationFlashTaskbar) => update({ notificationFlashTaskbar })}
                        />
                    </SettingRow>
                    <SettingRow label="Play a sound">
                        <SegmentedControl testID="notification-sound-mode" options={SOUND_MODES} value={soundMode} onChange={setSoundMode} />
                    </SettingRow>
                    <SettingRow label="Skip channels that are already live when Chatterino starts">
                        <Switch
                            testID="setting-suppressInitialLiveNotification"
                            label="Skip channels that are already live when Chatterino starts"
                            value={settings.suppressInitialLiveNotification}
                            onChange={(suppressInitialLiveNotification) => update({ suppressInitialLiveNotification })}
                        />
                    </SettingRow>
                </SettingRowsCard>
            </SettingsSection>
            <SettingsSection tokens={tokens} title="Sound">
                <SettingRowsCard>
                    <SettingRow label="Use a custom sound">
                        <Switch
                            testID="setting-notificationCustomSound"
                            label="Use a custom sound"
                            value={settings.notificationCustomSound}
                            onChange={(notificationCustomSound) => update({ notificationCustomSound })}
                        />
                    </SettingRow>
                    <SettingRow label="Sound file" stacked>
                        <SettingPathValue testID="notifications-sound-path" value={soundFile || "Chatterino default"} />
                        <Button
                            testID="notifications-select-sound"
                            label="Choose file"
                            onPress={() => actions.pickSound((notificationPathSound) => update({ notificationPathSound }))}
                        />
                        <Button testID="notifications-play-sound" label="Play" onPress={play} />
                    </SettingRow>
                </SettingRowsCard>
            </SettingsSection>
            <SettingsSection tokens={tokens}>
                <SettingsSectionHeading title="Channels" description="Used when the sound is set to selected channels." />
                <ChannelListEditor
                    testID="notification-channel"
                    channels={channels}
                    showStatus
                    emptyIcon={PAGE_ICONS.bell}
                    emptyTitle="No channels yet"
                    emptyDescription="Add a channel above to hear about it when it goes live."
                    onChange={(notificationChannels) => update({ notificationChannels })}
                />
            </SettingsSection>
        </SettingsPageFrame>
    );
}
