import { ModernExternalToolsPage } from "../modern/settingsPages/ModernExternalToolsPage";
import { useApp } from "../state/AppContext";
import { externalToolsItems } from "./externalToolsOptions";
import { GeneralPageView } from "./GeneralPageView";
import { useSettingsUi } from "./SettingsContext";
import { useSettingsAccess } from "./useSettingsAccess";

export function ExternalToolsPage() {
    const { theme } = useApp();
    const access = useSettingsAccess();
    const { query } = useSettingsUi();
    if (theme.modern) return <ModernExternalToolsPage />;
    return <GeneralPageView testID="settings-external" items={externalToolsItems(access.canSpawn)} access={access} query={query} navigation={false} />;
}
