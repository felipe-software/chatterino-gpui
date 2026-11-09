import { useState } from "react";
import { View } from "@felipe-software/react-native-gpui";
import { ModernIgnoresPage } from "../modern/settingsPages/ModernIgnoresPage";
import { useApp } from "../state/AppContext";
import { IgnorePhrasesTab } from "./IgnorePhrasesTab";
import { IgnoreUsersTab } from "./IgnoreUsersTab";
import { TabWidget } from "./TabWidget";

export const IGNORE_TABS = ["Messages", "Users"];

export function IgnoresPage() {
    const { theme } = useApp();
    const [tab, setTab] = useState(IGNORE_TABS[0]);
    if (theme.modern) return <ModernIgnoresPage />;
    return (
        <View testID="settings-ignores" style={{ flex: 1, padding: 10, paddingRight: 9 }}>
            <TabWidget testID="ignores" tabs={IGNORE_TABS} selected={tab} onSelect={setTab}>
                {tab === "Messages" ? <IgnorePhrasesTab /> : <IgnoreUsersTab />}
            </TabWidget>
        </View>
    );
}
