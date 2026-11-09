import { useState } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import { COLOR_SELF_HIGHLIGHT } from "../../../data/filters/highlights";
import { BadgePickerContent } from "../../settings/BadgePickerContent";
import { MESSAGE_BUILTINS, newHighlightBadge, newHighlightUser, newPhrase, USER_BUILTINS } from "../../settings/highlightRows";
import { useSettingsUi } from "../../settings/SettingsContext";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { useApp } from "../../state/AppContext";
import { Button } from "../controls/Button";
import { EmptyState } from "../controls/EmptyState";
import { Tabs } from "../controls/Tabs";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_ICONS } from "../icons";
import { HighlightBadgesTable } from "./HighlightBadgesTable";
import { HighlightBlockedTable } from "./HighlightBlockedTable";
import { HighlightMessagesTable } from "./HighlightMessagesTable";
import { HighlightSoundSection } from "./HighlightSoundSection";
import { HighlightUsersTable } from "./HighlightUsersTable";
import { PageHeader } from "./PageHeader";
import { PAGE_ICONS } from "./pageIcons";
import { SettingsPageFrame } from "./SettingsPageFrame";

type HighlightTab = "messages" | "users" | "badges" | "blocked";

const ADD_LABELS: Record<HighlightTab, string> = { messages: "Add pattern", users: "Add user", badges: "Add badge", blocked: "Add user" };
const BLOCKED_NOTE = "No sounds or highlights from these users. Handy for bots that repeat your name.";

export function ModernHighlightsPage() {
    const { settings, fonts } = useApp();
    const tokens = useModernTokens();
    const ui = useSettingsUi();
    const { update } = useSettingsUpdate();
    const [tab, setTab] = useState<HighlightTab>("messages");
    const [autoEdit, setAutoEdit] = useState<number | null>(null);
    const selfColor = settings.selfHighlightColor || COLOR_SELF_HIGHLIGHT;
    const phrases = settings.highlightPhrases;
    const users = settings.highlightUsers;
    const badges = settings.highlightBadges;
    const blocked = settings.blacklistedUsers;
    const doneEditing = () => setAutoEdit(null);

    const pickBadge = () =>
        ui.openPopup({
            kind: "modal",
            title: "Add badge highlight",
            width: 340,
            height: 440,
            render: (close) => (
                <BadgePickerContent
                    onPick={(badge) => {
                        update({ highlightBadges: [...badges, newHighlightBadge(badge, selfColor)] });
                        close();
                    }}
                    onCancel={close}
                />
            ),
        });

    const add = () => {
        if (tab === "messages") {
            setAutoEdit(MESSAGE_BUILTINS.length + phrases.length);
            update({ highlightPhrases: [...phrases, newPhrase(selfColor)] });
        }
        if (tab === "users") {
            setAutoEdit(USER_BUILTINS.length + users.length);
            update({ highlightUsers: [...users, newHighlightUser(selfColor)] });
        }
        if (tab === "badges") pickBadge();
        if (tab === "blocked") {
            setAutoEdit(blocked.length);
            update({ blacklistedUsers: [...blocked, { pattern: "blacklisted user", isRegex: false }] });
        }
    };

    const tabs = [
        { value: "messages" as const, label: "Messages", badge: String(MESSAGE_BUILTINS.length + phrases.length) },
        { value: "users" as const, label: "Users", badge: String(USER_BUILTINS.length + users.length) },
        { value: "badges" as const, label: "Badges", badge: String(badges.length) },
        { value: "blocked" as const, label: "Blocked users", badge: String(blocked.length) },
    ];
    const switchTab = (next: HighlightTab) => {
        setAutoEdit(null);
        setTab(next);
    };

    return (
        <SettingsPageFrame testID="settings-highlights" gap={20}>
            <PageHeader
                title="Highlights"
                description="Tint, flash or ping for the messages you care about. Messages win over users, users over badges."
                actions={<Button testID="highlights-add" label={ADD_LABELS[tab]} icon={MODERN_ICONS.plus} onPress={add} />}
            />
            <Tabs testID="highlights-tabs" tabs={tabs} value={tab} onChange={switchTab} />
            {tab === "messages" ? <HighlightMessagesTable autoEdit={autoEdit} onAutoEditDone={doneEditing} /> : null}
            {tab === "users" ? <HighlightUsersTable autoEdit={autoEdit} onAutoEditDone={doneEditing} /> : null}
            {tab === "badges" && badges.length > 0 ? <HighlightBadgesTable /> : null}
            {tab === "badges" && badges.length === 0 ? (
                <EmptyState
                    bordered
                    icon={PAGE_ICONS.badge}
                    title="No badge highlights yet"
                    description="Highlight everyone wearing a badge, like all moderators or all VIPs in a channel."
                >
                    <Button testID="highlights-add-badge" label="Add badge highlight" onPress={pickBadge} />
                </EmptyState>
            ) : null}
            {tab === "blocked" ? <Text style={{ color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 }}>{BLOCKED_NOTE}</Text> : null}
            {tab === "blocked" ? <HighlightBlockedTable autoEdit={autoEdit} onAutoEditDone={doneEditing} /> : null}
            <View style={{ marginTop: 8 }}>
                <HighlightSoundSection />
            </View>
        </SettingsPageFrame>
    );
}
