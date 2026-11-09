import { useState } from "react";
import { View } from "@felipe-software/react-native-gpui";
import type { HotkeyOverride } from "../../../data/api";
import { HOTKEYS } from "../../hotkeys";
import { unsupportedTooltip } from "../../settings/generalHelpers";
import { HotkeyEditContent } from "../../settings/HotkeyEditContent";
import { MODERN_HOTKEY_GROUPS, resolveHotkeys, type HotkeyEntry } from "../../settings/hotkeyCatalog";
import { useSettingsUi } from "../../settings/SettingsContext";
import { useSettingsActions } from "../../settings/useSettingsActions";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { useApp } from "../../state/AppContext";
import { Button } from "../controls/Button";
import { EmptyState } from "../controls/EmptyState";
import { CONTROL_ICONS } from "../controls/icons";
import { TextField } from "../controls/TextField";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_ICONS } from "../icons";
import { SettingsCard } from "../settings/SettingsCard";
import { SettingsSection } from "../settings/SettingsSection";
import { HotkeyRow } from "./HotkeyRow";
import { PageHeader } from "./PageHeader";
import { SettingsPageFrame } from "./SettingsPageFrame";

const IMPLEMENTED = new Set(HOTKEYS.map((binding) => binding.id));
const NOT_WORKING = unsupportedTooltip(undefined, "this app has no handler for this action yet.");

function isWorking(entry: HotkeyEntry): boolean {
    return !!entry.builtIn || (!!entry.action && IMPLEMENTED.has(entry.action));
}

function compact(text: string): string {
    return text.replace(/\s+/g, "").toLowerCase();
}

function matches(entry: HotkeyEntry, search: string, query: string): boolean {
    const name = entry.name.toLowerCase();
    const needle = search.trim().toLowerCase();
    const bySearch = !needle || name.includes(needle) || compact(entry.key).includes(compact(needle));
    const byQuery = !query.trim() || name.includes(query.trim().toLowerCase());
    return bySearch && byQuery;
}

export function ModernHotkeysPage() {
    const { settings } = useApp();
    const tokens = useModernTokens();
    const ui = useSettingsUi();
    const { update } = useSettingsUpdate();
    const actions = useSettingsActions();
    const [search, setSearch] = useState("");
    const overrides = settings.hotkeyOverrides;
    const entries = resolveHotkeys(overrides).filter((entry) => matches(entry, search, ui.query));
    const groups = MODERN_HOTKEY_GROUPS.map((group) => ({ ...group, entries: entries.filter((entry) => entry.category === group.category) })).filter(
        (group) => group.entries.length > 0,
    );

    const setOverride = (next: HotkeyOverride) => update({ hotkeyOverrides: [...overrides.filter((override) => override.id !== next.id), next] });
    const openEditor = (entry?: HotkeyEntry) =>
        ui.openPopup({
            kind: "modal",
            title: entry ? "Change shortcut" : "Add hotkey",
            width: 440,
            height: entry ? 300 : 360,
            render: (close) => (
                <HotkeyEditContent
                    entry={entry}
                    onAccept={(override) => {
                        setOverride(override);
                        close();
                    }}
                    onCancel={close}
                />
            ),
        });
    const reset = () => actions.confirm("Reset hotkeys", "Are you sure you want to reset hotkeys to defaults?", () => update({ hotkeyOverrides: [] }));

    return (
        <SettingsPageFrame testID="settings-hotkeys" gap={24}>
            <PageHeader
                title="Hotkeys"
                description="Click a shortcut to change it."
                actions={
                    <>
                        <Button testID="hotkeys-reset" label="Reset to defaults" variant="ghost" onPress={reset} />
                        <Button testID="hotkeys-add" label="Add hotkey" icon={MODERN_ICONS.plus} onPress={() => openEditor()} />
                    </>
                }
            />
            <TextField
                testID="hotkeys-search"
                size="md"
                height={36}
                leadingIcon={CONTROL_ICONS.search}
                placeholder="Search by action or key"
                value={search}
                onChange={setSearch}
                clearable
            />
            {groups.length === 0 ? <EmptyState bordered title="No hotkeys match" description="Try another action name or key." /> : null}
            {groups.map((group) => (
                <SettingsSection key={group.category} tokens={tokens} title={group.title}>
                    <SettingsCard tokens={tokens}>
                        <View>
                            {group.entries.map((entry, index) => {
                                const working = isWorking(entry);
                                return (
                                    <HotkeyRow
                                        key={entry.name}
                                        testID={`hotkey-${entry.name}`}
                                        entry={entry}
                                        working={working}
                                        first={index === 0}
                                        tooltip={working ? undefined : NOT_WORKING}
                                        onEdit={() => openEditor(entry)}
                                    />
                                );
                            })}
                        </View>
                    </SettingsCard>
                </SettingsSection>
            ))}
        </SettingsPageFrame>
    );
}
