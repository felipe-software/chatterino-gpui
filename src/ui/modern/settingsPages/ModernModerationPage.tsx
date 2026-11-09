import { useState } from "react";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { useApp } from "../../state/AppContext";
import { Tabs } from "../controls/Tabs";
import { ModerationButtonsPanel } from "./ModerationButtonsPanel";
import { ModerationLogsPanel } from "./ModerationLogsPanel";
import { PageHeader } from "./PageHeader";
import { SettingsPageFrame } from "./SettingsPageFrame";
import { TimeoutButtonsPanel } from "./TimeoutButtonsPanel";

export type ModerationTab = "logs" | "buttons" | "timeouts";

type Props = { initialTab: ModerationTab; logDirectory: string; loggingUnavailable: string };

const TABS: Array<{ value: ModerationTab; label: string }> = [
    { value: "logs", label: "Logs" },
    { value: "buttons", label: "Moderation buttons" },
    { value: "timeouts", label: "Timeout buttons" },
];
const NEW_ACTION = { action: "/timeout {user.name} 300" };

export function ModernModerationPage({ initialTab, logDirectory, loggingUnavailable }: Props) {
    const { settings } = useApp();
    const { update } = useSettingsUpdate();
    const [tab, setTab] = useState<ModerationTab>(initialTab);
    const [autoEdit, setAutoEdit] = useState<number | null>(null);
    const addAction = () => {
        setAutoEdit(settings.moderationActions.length);
        update({ moderationActions: [...settings.moderationActions, NEW_ACTION] });
    };
    const switchTab = (next: ModerationTab) => {
        setAutoEdit(null);
        setTab(next);
    };
    return (
        <SettingsPageFrame testID="settings-moderation" gap={20}>
            <PageHeader title="Moderation" description="Logs and the quick actions you get in channels you moderate." />
            <Tabs testID="moderation-tabs" tabs={TABS} value={tab} onChange={switchTab} />
            {tab === "logs" ? <ModerationLogsPanel logDirectory={logDirectory} unavailable={loggingUnavailable} /> : null}
            {tab === "buttons" ? <ModerationButtonsPanel autoEdit={autoEdit} onAutoEditDone={() => setAutoEdit(null)} onAdd={addAction} /> : null}
            {tab === "timeouts" ? <TimeoutButtonsPanel /> : null}
        </SettingsPageFrame>
    );
}
