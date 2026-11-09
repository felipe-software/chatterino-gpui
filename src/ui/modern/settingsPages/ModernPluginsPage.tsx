import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { useApp } from "../../state/AppContext";
import { Button } from "../controls/Button";
import { Callout } from "../controls/Callout";
import { EmptyState } from "../controls/EmptyState";
import { Switch } from "../controls/Switch";
import { useModernTokens } from "../controls/useModernTokens";
import { SettingPathValue } from "../settings/SettingPathValue";
import { SettingRow } from "../settings/SettingRow";
import { SettingRowsCard } from "../settings/SettingRowsCard";
import { SettingsSection } from "../settings/SettingsSection";
import { PageHeader } from "./PageHeader";
import { PAGE_ICONS } from "./pageIcons";
import { SettingsPageFrame } from "./SettingsPageFrame";

type Props = { pluginsDirectory: string; unavailable: string; manualUrl: string };

export function ModernPluginsPage({ pluginsDirectory, unavailable, manualUrl }: Props) {
    const { settings, openUrl } = useApp();
    const tokens = useModernTokens();
    const { update } = useSettingsUpdate();
    return (
        <SettingsPageFrame testID="settings-plugins" gap={24}>
            <PageHeader title="Plugins" description="Extend Chatterino with Lua. Still in public alpha." />
            <Callout
                tone="warning"
                size="lg"
                title="Only install plugins you trust"
                description="Permissions are best effort. Assume any plugin can run code on your computer."
            />
            <SettingRowsCard>
                <SettingRow label="Enable plugins" hint="Needs a restart" tooltip={unavailable}>
                    <Switch
                        testID="setting-pluginsEnabled"
                        label="Enable plugins"
                        value={settings.pluginsEnabled}
                        onChange={(pluginsEnabled) => update({ pluginsEnabled })}
                    />
                </SettingRow>
                <SettingRow label="Plugins folder" stacked>
                    <SettingPathValue testID="plugins-folder" value={pluginsDirectory} />
                </SettingRow>
            </SettingRowsCard>
            <SettingsSection tokens={tokens} title="Installed">
                <EmptyState
                    bordered
                    icon={PAGE_ICONS.plug}
                    title="No plugins loaded"
                    description="Each plugin is a folder inside the plugins folder. This app can't run Lua yet, so none can load."
                >
                    <Button testID="plugins-manual" label="Read the manual" onPress={() => openUrl(manualUrl)} />
                </EmptyState>
            </SettingsSection>
        </SettingsPageFrame>
    );
}
