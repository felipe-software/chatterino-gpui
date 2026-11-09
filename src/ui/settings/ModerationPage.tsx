import { useState } from "react";
import { View } from "@felipe-software/react-native-gpui";
import { ModernModerationPage, type ModerationTab } from "../modern/settingsPages/ModernModerationPage";
import { useApp } from "../state/AppContext";
import { ModerationButtonsTab } from "./ModerationButtonsTab";
import { defaultLogDirectory, ModerationLogsTab, NO_LOGGING } from "./ModerationLogsTab";
import { TabWidget } from "./TabWidget";
import { TimeoutButtonsTab } from "./TimeoutButtonsTab";

export const MODERATION_TABS = ["Logs", "Moderation buttons", "User Timeout Buttons"];

const MODERN_TABS: Record<string, ModerationTab> = { Logs: "logs", "Moderation buttons": "buttons", "User Timeout Buttons": "timeouts" };

export function ModerationPage({ initialTab }: { initialTab?: string }) {
    const { theme } = useApp();
    const [tab, setTab] = useState(initialTab && MODERATION_TABS.includes(initialTab) ? initialTab : MODERATION_TABS[0]);
    if (theme.modern) return <ModernModerationPage initialTab={MODERN_TABS[tab] ?? "logs"} logDirectory={defaultLogDirectory()} loggingUnavailable={NO_LOGGING} />;
    return (
        <View testID="settings-moderation" style={{ flex: 1, padding: 10, paddingRight: 9 }}>
            <TabWidget testID="moderation" tabs={MODERATION_TABS} selected={tab} onSelect={setTab}>
                {tab === "Logs" ? <ModerationLogsTab /> : null}
                {tab === "Moderation buttons" ? <ModerationButtonsTab /> : null}
                {tab === "User Timeout Buttons" ? <TimeoutButtonsTab /> : null}
            </TabWidget>
        </View>
    );
}
