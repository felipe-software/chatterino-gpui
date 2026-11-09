import { Platform } from "@felipe-software/react-native-gpui";
import { fileName } from "../../settings/highlightRows";
import { SComboBox } from "../../settings/SComboBox";
import { useSettingsActions } from "../../settings/useSettingsActions";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { useApp } from "../../state/AppContext";
import { Switch } from "../controls/Switch";
import { useModernTokens } from "../controls/useModernTokens";
import { SettingRow } from "../settings/SettingRow";
import { SettingRowsCard } from "../settings/SettingRowsCard";
import { SettingsSection } from "../settings/SettingsSection";

const FLASH_NOTE = "Not available in this app: the taskbar can only be flashed on macOS.";
const DEFAULT_SOUND_TOOLTIP = "Plays for every highlight that has Sound on and no sound file of its own.";
const PING = "ping";
const CUSTOM = "custom";
const CHOOSE = "choose";

export function HighlightSoundSection() {
    const { settings } = useApp();
    const tokens = useModernTokens();
    const { update } = useSettingsUpdate();
    const actions = useSettingsActions();
    const path = settings.pathHighlightSound;
    const customName = fileName(path);
    const options = [
        ...(customName ? [{ value: CUSTOM, label: customName }] : []),
        { value: PING, label: "Chatterino ping" },
        { value: CHOOSE, label: "Choose a file…" },
    ];
    const choose = (value: string) => {
        if (value === PING) update({ pathHighlightSound: "" });
        if (value === CHOOSE) actions.pickSound((next) => update({ pathHighlightSound: next }));
    };
    return (
        <SettingsSection tokens={tokens} title="Sound and taskbar">
            <SettingRowsCard>
                <SettingRow label="Default sound" tooltip={DEFAULT_SOUND_TOOLTIP}>
                    <SComboBox testID="highlight-default-sound" value={customName ? CUSTOM : PING} options={options} greyable={false} onChange={choose} />
                </SettingRow>
                <SettingRow label="Play sounds while Chatterino is focused">
                    <Switch
                        testID="setting-highlightAlwaysPlaySound"
                        label="Play sounds while Chatterino is focused"
                        value={settings.highlightAlwaysPlaySound}
                        onChange={(highlightAlwaysPlaySound) => update({ highlightAlwaysPlaySound })}
                    />
                </SettingRow>
                <SettingRow label="Keep the taskbar flashing until Chatterino is focused" tooltip={Platform.OS === "macos" ? undefined : FLASH_NOTE}>
                    <Switch
                        testID="setting-longAlerts"
                        label="Keep the taskbar flashing until Chatterino is focused"
                        value={settings.longAlerts}
                        onChange={(longAlerts) => update({ longAlerts })}
                    />
                </SettingRow>
            </SettingRowsCard>
        </SettingsSection>
    );
}
