import { useCallback, useMemo, useRef, useState } from "react";
import { View, type MouseResponderEvent } from "@felipe-software/react-native-gpui";
import { FloatingWindow } from "../common/FloatingWindow";
import { ModernGeneralPage } from "../modern/settings/ModernGeneralPage";
import { ModernSettingsShell } from "../modern/settings/ModernSettingsShell";
import { classicPageFor, isModernGeneralPage, MODERN_PAGE_ORDER, resolveModernPage, type ModernPageName } from "../modern/settings/modernSettingsPages";
import { AboutPage } from "../settings/AboutPage";
import { AccountsPage } from "../settings/AccountsPage";
import { CommandsPage } from "../settings/CommandsPage";
import { ExternalToolsPage } from "../settings/ExternalToolsPage";
import { FiltersPage } from "../settings/FiltersPage";
import { GeneralPage } from "../settings/GeneralPage";
import { HighlightsPage } from "../settings/HighlightsPage";
import { HotkeysPage } from "../settings/HotkeysPage";
import { IgnoresPage } from "../settings/IgnoresPage";
import { ModerationPage } from "../settings/ModerationPage";
import { NicknamesPage } from "../settings/NicknamesPage";
import { NotificationsPage } from "../settings/NotificationsPage";
import { modernPageMatches, pageMatches } from "../settings/pageSearch";
import { PluginsPage } from "../settings/PluginsPage";
import { SettingsUiContext, type Point, type PopupSpec, type SettingsUi } from "../settings/SettingsContext";
import { SettingsNavTab } from "../settings/SettingsNavTab";
import { resolvePage, SETTINGS_PAGES, type SettingsPageName } from "../settings/settingsPages";
import { SettingsPopupLayer } from "../settings/SettingsPopupLayer";
import { SettingsSearchField } from "../settings/SettingsSearchField";
import { SETTINGS_STYLE } from "../settings/settingsStyle";
import { SPushButton } from "../settings/SPushButton";
import { AppContext, useApp } from "../state/AppContext";
import { themeFor } from "../theme";

const WIDTH = 915;
const HEIGHT = 600;
const MODERN_WIDTH = 980;
const MODERN_HEIGHT = 810;
const TITLE_HEIGHT = 28;
const GROUP_SPACING = 16;

function renderPage(page: SettingsPageName, initialTab: string | undefined) {
    switch (page) {
        case "General":
            return <GeneralPage />;
        case "Accounts":
            return <AccountsPage />;
        case "Nicknames":
            return <NicknamesPage />;
        case "Commands":
            return <CommandsPage />;
        case "Highlights":
            return <HighlightsPage />;
        case "Ignores":
            return <IgnoresPage />;
        case "Filters":
            return <FiltersPage />;
        case "Hotkeys":
            return <HotkeysPage />;
        case "Moderation":
            return <ModerationPage initialTab={initialTab} />;
        case "Live Notifications":
            return <NotificationsPage />;
        case "External tools":
            return <ExternalToolsPage />;
        case "Plugins":
            return <PluginsPage />;
        case "About":
            return <AboutPage />;
    }
}

function renderModernPage(page: ModernPageName, initialTab: string | undefined) {
    if (isModernGeneralPage(page)) return <ModernGeneralPage name={page} />;
    return renderPage(page, initialTab);
}

function spacingFor(index: number, visible: SettingsPageName[]): number {
    const page = SETTINGS_PAGES.find((entry) => entry.name === visible[index]);
    const previous = SETTINGS_PAGES.find((entry) => entry.name === visible[index - 1]);
    if (!page || !previous || page.group === previous.group || page.group === 4) return 0;
    return GROUP_SPACING;
}

function initialQuery(page: string | undefined, modern: boolean): string {
    if (modern || page !== "StreamerMode") return "";
    return "Streamer Mode";
}

export function SettingsDialog({ page, onClose }: { page?: string; onClose: () => void }) {
    const services = useApp();
    const { core, prefsStore } = services;
    const modern = services.theme.modern !== undefined;
    const [selected, setSelected] = useState<string>(page ?? "");
    const [query, setQuery] = useState(() => initialQuery(page, modern));
    const [popup, setPopup] = useState<PopupSpec | null>(null);
    const [tooltip, setTooltip] = useState<{ text: string; at: Point } | null>(null);
    const origin = useRef<Point>({ x: 0, y: 0 });
    const snapshot = useRef({ settings: core.settings.get(), prefs: prefsStore.get() });
    const darkServices = useMemo(() => ({ ...services, theme: themeFor("dark") }), [services]);
    const settings = services.settings;
    const moderationTab = page === "ModerationActions" ? "Moderation buttons" : undefined;

    const trackOrigin = (event: MouseResponderEvent) => {
        origin.current = { x: event.nativeEvent.pageX - event.nativeEvent.locationX, y: event.nativeEvent.pageY - event.nativeEvent.locationY };
    };
    const ui = useMemo<SettingsUi>(
        () => ({
            query,
            toLocal: (point) => ({ x: point.x - origin.current.x, y: point.y - origin.current.y }),
            showTooltip: (text, at) => setTooltip({ text, at }),
            hideTooltip: () => setTooltip(null),
            openPopup: (spec) => {
                setTooltip(null);
                setPopup(spec);
            },
            closePopup: () => setPopup(null),
        }),
        [query],
    );
    const closePopup = useCallback(() => setPopup(null), []);

    const cancel = () => {
        core.settings.set(snapshot.current.settings);
        prefsStore.set(snapshot.current.prefs);
        onClose();
    };

    const renderModernBody = () => {
        const visible = MODERN_PAGE_ORDER.filter((name) => modernPageMatches(name, query, settings));
        const current = resolveModernPage(selected);
        const shown = visible.includes(current) ? current : (visible[0] ?? current);
        return (
            <View testID="settings-root" style={{ flex: 1 }} onMouseDown={trackOrigin} onMouseMove={trackOrigin}>
                <ModernSettingsShell page={shown} visible={visible} query={query} onQueryChange={setQuery} onSelect={setSelected} onCancel={cancel} onSave={onClose}>
                    {renderModernPage(shown, moderationTab)}
                </ModernSettingsShell>
                <SettingsPopupLayer width={MODERN_WIDTH} height={MODERN_HEIGHT} popup={popup} tooltip={tooltip} onClose={closePopup} />
            </View>
        );
    };

    const renderClassicBody = () => {
        const visible = SETTINGS_PAGES.map((entry) => entry.name).filter((name) => pageMatches(name, query, settings));
        const current = resolvePage(classicPageFor(selected === "ModerationActions" ? "Moderation" : selected));
        const shown = visible.includes(current) ? current : (visible[0] ?? current);
        const topPages = visible.filter((name) => name !== "About");
        const showAbout = visible.includes("About");
        return (
            <View
                testID="settings-root"
                style={{ flex: 1, backgroundColor: SETTINGS_STYLE.window, padding: 11 }}
                onMouseDown={trackOrigin}
                onMouseMove={trackOrigin}
            >
                <SettingsSearchField value={query} onChange={setQuery} />
                <View style={{ flex: 1, flexDirection: "row", marginTop: 12 }}>
                    <View style={{ width: 150, paddingTop: 20, paddingBottom: 20 }}>
                        {topPages.map((name, index) => {
                            const entry = SETTINGS_PAGES.find((candidate) => candidate.name === name);
                            return (
                                <SettingsNavTab
                                    key={name}
                                    name={name}
                                    icon={entry?.icon ?? "settings/about.svg"}
                                    selected={name === shown}
                                    marginTop={spacingFor(index, topPages)}
                                    onSelect={() => setSelected(name)}
                                />
                            );
                        })}
                        <View style={{ flex: 1 }} />
                        {showAbout ? (
                            <SettingsNavTab name="About" icon="settings/about.svg" selected={shown === "About"} marginTop={0} onSelect={() => setSelected("About")} />
                        ) : null}
                    </View>
                    <View testID="settings-content" style={{ flex: 1 }}>
                        {renderPage(shown, moderationTab)}
                    </View>
                </View>
                <View style={{ height: 35, flexDirection: "row", justifyContent: "flex-end", alignItems: "flex-end", gap: 8 }}>
                    <SPushButton testID="settings-cancel" label="Cancel" onPress={cancel} />
                    <SPushButton testID="settings-ok" label="Ok" onPress={onClose} />
                </View>
                <SettingsPopupLayer width={WIDTH - 2} height={HEIGHT} popup={popup} tooltip={tooltip} onClose={closePopup} />
            </View>
        );
    };

    const dialogServices = modern ? services : darkServices;
    const frameWidth = modern ? MODERN_WIDTH : WIDTH;
    const frameHeight = modern ? MODERN_HEIGHT : HEIGHT + TITLE_HEIGHT;
    const frameKey = modern ? "modern" : "chatterino";
    return (
        <AppContext.Provider value={dialogServices}>
            <SettingsUiContext.Provider value={ui}>
                <FloatingWindow key={frameKey} testID="settings-dialog" title="Chatterino Settings" width={frameWidth} height={frameHeight} onClose={onClose}>
                    {modern ? renderModernBody() : renderClassicBody()}
                </FloatingWindow>
            </SettingsUiContext.Provider>
        </AppContext.Provider>
    );
}
