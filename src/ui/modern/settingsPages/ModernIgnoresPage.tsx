import { useState } from "react";
import { DEFAULT_IGNORE_REPLACEMENT } from "../../../data/filters/ignores";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { useApp } from "../../state/AppContext";
import { useStore } from "../../state/useStore";
import { Button } from "../controls/Button";
import { EmptyState } from "../controls/EmptyState";
import { Note } from "../controls/Note";
import { Tabs } from "../controls/Tabs";
import { MODERN_ICONS } from "../icons";
import { IgnoredUsersPanel } from "./IgnoredUsersPanel";
import { IgnorePatternsTable } from "./IgnorePatternsTable";
import { PageHeader } from "./PageHeader";
import { PAGE_ICONS } from "./pageIcons";
import { SettingsPageFrame } from "./SettingsPageFrame";

type IgnoreTab = "messages" | "users";

const REGEX_URL = "https://chatterino.com/help/regex";
const NEW_PATTERN = { pattern: "my pattern", isRegex: false, caseSensitive: true, isBlock: false, replaceWith: DEFAULT_IGNORE_REPLACEMENT };

export function ModernIgnoresPage() {
    const { core, settings, openUrl } = useApp();
    const { update } = useSettingsUpdate();
    const twitchBlocks = useStore(core.blockedUsers);
    const [tab, setTab] = useState<IgnoreTab>("messages");
    const [autoEdit, setAutoEdit] = useState<number | null>(null);
    const [addingUser, setAddingUser] = useState(false);
    const phrases = settings.ignoredPhrases;
    const userCount = new Set([...twitchBlocks, ...settings.ignoredUsers]).size;

    const add = () => {
        if (tab === "users") {
            setAddingUser(true);
            return;
        }
        setAutoEdit(phrases.length);
        update({ ignoredPhrases: [...phrases, NEW_PATTERN] });
    };
    const addButton = <Button testID="ignores-add" label={tab === "users" ? "Add user" : "Add pattern"} icon={MODERN_ICONS.plus} onPress={add} />;
    const switchTab = (next: IgnoreTab) => {
        setAutoEdit(null);
        setAddingUser(false);
        setTab(next);
    };

    return (
        <SettingsPageFrame testID="settings-ignores" gap={20}>
            <PageHeader title="Ignores" description="Hide or rewrite messages before you ever see them." actions={addButton} />
            <Tabs
                testID="ignores-tabs"
                tabs={[
                    { value: "messages", label: "Messages", badge: String(phrases.length) },
                    { value: "users", label: "Users", badge: String(userCount) },
                ]}
                value={tab}
                onChange={switchTab}
            />
            {tab === "messages" && phrases.length > 0 ? <IgnorePatternsTable autoEdit={autoEdit} onAutoEditDone={() => setAutoEdit(null)} /> : null}
            {tab === "messages" && phrases.length === 0 ? (
                <EmptyState
                    bordered
                    icon={PAGE_ICONS.eyeOff}
                    title="No ignored patterns yet"
                    description="Hide messages that match a word or a regex, or swap the match for something else."
                >
                    {addButton}
                </EmptyState>
            ) : null}
            {tab === "users" ? <IgnoredUsersPanel adding={addingUser} onAddDone={() => setAddingUser(false)} /> : null}
            {tab === "messages" ? (
                <Note
                    icon={PAGE_ICONS.info}
                    text="Patterns are checked top to bottom. New to regex?"
                    link={{ label: "Read the quick guide", onPress: () => openUrl(REGEX_URL) }}
                />
            ) : (
                <Note icon={PAGE_ICONS.info} text="/block and /unblock in chat, or the user card, change this list too." />
            )}
        </SettingsPageFrame>
    );
}
