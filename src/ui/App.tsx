import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppCommands, Linking } from "@felipe-software/react-native-gpui";
import { createChatCore } from "../data";
import type { ChannelInfo } from "../data/api";
import { fontsFor } from "./fonts";
import { HOTKEYS, runHotkey } from "./hotkeys";
import { splitLeaves } from "./layout/tree";
import { applyHotkeyOverrides } from "./settings/hotkeyCatalog";
import { AppContext, type AppServices, type DragState, type TabActivity } from "./state/AppContext";
import { hitAreas } from "./state/hitAreas";
import { newId } from "./state/ids";
import { inputRegistry } from "./state/inputs";
import { createLayoutActions } from "./state/layoutActions";
import { modernTheme } from "./modern/modernTheme";
import { closeOverlay, openOverlay, type Overlay, type OverlaySpec, type TooltipSpec } from "./state/overlays";
import { createPrefsStore } from "./state/prefs";
import { createUiStore } from "./state/store";
import { useChatterinoImportPrompt } from "./state/useChatterinoImportPrompt";
import { useChatterinoUiPrefs } from "./state/useChatterinoUiPrefs";
import { persistWindowGeometry } from "./state/windowGeometry";
import { useStore } from "./state/useStore";
import { themeFor } from "./theme";
import { MainWindow } from "./window/MainWindow";

const CHANNEL_LINK = "chatterino://channel/";

function mentionChannel(link: string | undefined): string | undefined {
    if (!link?.startsWith(CHANNEL_LINK)) return undefined;
    return link.slice(CHANNEL_LINK.length);
}

export function App() {
    const core = useMemo(() => createChatCore(), []);
    const prefsStore = useMemo(() => createPrefsStore(), []);
    const channelInfos = useMemo(() => createUiStore<Record<string, ChannelInfo>>({}), []);
    const tabActivity = useMemo(() => createUiStore<Record<string, TabActivity>>({}), []);
    const drag = useMemo(() => createUiStore<DragState | null>(null), []);
    const settings = useStore(core.settings);
    const prefs = useStore(prefsStore);
    const [overlays, setOverlays] = useState<Overlay[]>([]);
    const [tooltip, setTooltip] = useState<TooltipSpec | null>(null);

    const open = useCallback((spec: OverlaySpec) => {
        const id = newId("overlay");
        setOverlays((stack) => openOverlay(stack, spec, id));
        return id;
    }, []);
    const close = useCallback((id: string) => setOverlays((stack) => closeOverlay(stack, id)), []);
    const showTooltip = useCallback((spec: TooltipSpec) => setTooltip(spec), []);
    const hideTooltip = useCallback((owner: string) => setTooltip((current) => (current?.owner === owner ? null : current)), []);
    const openUrl = useCallback((url: string) => {
        Linking.openURL(url).catch((error: unknown) => console.warn("cannot open url", url, error));
    }, []);

    const actions = useMemo(
        () =>
            createLayoutActions({
                layout: core.layout,
                focusInput: (splitId) => inputRegistry.get(splitId)?.focus(),
                openSelectChannel: (splitId, isNew) => open({ kind: "selectChannel", splitId, isNew }),
            }),
        [core, open],
    );

    const isModern = settings.uiStyle === "modern";
    const theme = useMemo(
        () => (isModern ? modernTheme(settings.theme, settings.accentColor) : themeFor(settings.theme)),
        [isModern, settings.theme, settings.accentColor],
    );
    const fonts = useMemo(() => fontsFor(settings), [settings.fontFamily, settings.fontSize, settings.uiScale, settings.uiStyle]);

    const services = useMemo<AppServices>(
        () => ({
            core,
            theme,
            fonts,
            settings,
            prefs,
            prefsStore,
            channelInfos,
            tabActivity,
            drag,
            actions,
            overlays,
            openOverlay: open,
            closeOverlay: close,
            showTooltip,
            hideTooltip,
            openUrl,
        }),
        [core, theme, fonts, settings, prefs, prefsStore, channelInfos, tabActivity, drag, actions, overlays, open, close, showTooltip, hideTooltip, openUrl],
    );
    const latest = useRef(services);
    latest.current = services;

    useEffect(() => {
        (globalThis as { __chatterinoDebug?: () => AppServices & { hitAreas: typeof hitAreas } }).__chatterinoDebug = () => ({
            ...latest.current,
            hitAreas,
        });
    }, []);

    useEffect(() => {
        AppCommands.configure({ bindings: applyHotkeyOverrides(HOTKEYS, settings.hotkeyOverrides), menus: [] });
    }, [settings.hotkeyOverrides]);

    useEffect(() => AppCommands.addListener((id) => runHotkey(id, latest.current)), []);

    useChatterinoImportPrompt(core, open);
    useChatterinoUiPrefs(core, prefsStore);

    useEffect(() => persistWindowGeometry(), []);

    useEffect(() => {
        const timer = setTimeout(() => {
            const tab = core.layout.get().tabs.find((entry) => entry.id === core.layout.get().selectedTabId);
            if (tab?.focusedSplitId) inputRegistry.get(tab.focusedSplitId)?.focus();
        }, 300);
        return () => clearTimeout(timer);
    }, [core]);

    useEffect(
        () =>
            core.mentions.subscribe((event) => {
                if (event.type !== "append") return;
                const layout = core.layout.get();
                for (const message of event.messages) {
                    if (message.historical) continue;
                    const first = message.elements[0];
                    const channel = mentionChannel(first?.kind === "text" ? first.link : undefined);
                    if (!channel) continue;
                    for (const tab of layout.tabs) {
                        const hasChannel = splitLeaves(tab.root).some((leaf) => leaf.channel === channel);
                        const muted = latest.current.prefs.mutedTabs.includes(tab.id);
                        if (!hasChannel || muted || tab.id === layout.selectedTabId) continue;
                        tabActivity.set((activity) => ({ ...activity, [tab.id]: "highlighted" }));
                    }
                }
            }),
        [core, tabActivity],
    );

    useEffect(() => () => core.dispose(), [core]);

    return (
        <AppContext.Provider value={services}>
            <MainWindow tooltip={tooltip} />
        </AppContext.Provider>
    );
}
