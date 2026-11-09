import { View, type LayoutChangeEvent, type MouseResponderEvent } from "@felipe-software/react-native-gpui";
import type { TabLayout, WindowLayout } from "../../../data/api";
import type { Rect } from "../../layout/geometry";
import { splitLeaves } from "../../layout/tree";
import { IconButton } from "../controls/IconButton";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_ICONS } from "../icons";
import { ModernTab, type ModernTabModel } from "./ModernTab";
import { splitLayoutIcon } from "./splitLayoutIcon";
import { useMentionCounts } from "./useMentionCounts";

export type TabBarTab = Omit<ModernTabModel, "splitCount" | "layoutIcon" | "mentions"> & { tab: TabLayout };

export type TabBarHandlers = {
    select: (tabId: string) => void;
    close: (tabId: string) => void;
    rename: (tabId: string) => void;
    menu: (tab: TabLayout, x: number, y: number) => void;
    reorder: (tabId: string, x: number, y: number) => void;
    tabLayout: (tabId: string, rect: Rect) => void;
    add: () => void;
    addLayout: (rect: Rect) => void;
    accounts: (event: MouseResponderEvent) => void;
    settings: () => void;
    barMenu: (x: number, y: number) => void;
};

type Props = {
    layout: WindowLayout;
    tabs: TabBarTab[];
    tabsShown: boolean;
    showLive: boolean;
    closable: boolean;
    handlers: TabBarHandlers;
};

function modelOf(entry: TabBarTab, mentions: number): ModernTabModel {
    const splitCount = splitLeaves(entry.tab.root).length;
    const layoutIcon = entry.tab.root && splitCount > 1 ? splitLayoutIcon(entry.tab.root) : undefined;
    return { id: entry.id, title: entry.title, state: entry.state, live: entry.live, splitCount, layoutIcon, mentions };
}

export function ModernTabBar({ layout, tabs, tabsShown, showLive, closable, handlers }: Props) {
    const tokens = useModernTokens();
    const mentions = useMentionCounts(layout);
    return (
        <View
            testID="tab-bar"
            style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 6,
                padding: 6,
                backgroundColor: tokens.bgWindow,
                borderBottomWidth: 1,
                borderBottomColor: tokens.lineSubtle,
            }}
            onContextMenu={(event) => handlers.barMenu(event.nativeEvent.pageX, event.nativeEvent.pageY)}
        >
            <View style={{ flex: 1, minWidth: 0, flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                {tabs.map((entry) => (
                    <ModernTab
                        key={entry.id}
                        {...modelOf(entry, mentions[entry.id] ?? 0)}
                        showLive={showLive}
                        closable={closable}
                        onSelect={() => handlers.select(entry.id)}
                        onClose={() => handlers.close(entry.id)}
                        onRename={() => handlers.rename(entry.id)}
                        onMenu={(x, y) => handlers.menu(entry.tab, x, y)}
                        onReorder={(x, y) => handlers.reorder(entry.id, x, y)}
                        onLayout={(rect) => handlers.tabLayout(entry.id, rect)}
                    />
                ))}
                {tabsShown ? (
                    <View onLayout={(event: LayoutChangeEvent) => handlers.addLayout(event.nativeEvent.layout)}>
                        <IconButton testID="add-tab" icon={MODERN_ICONS.plus} label="Add tab" size={32} iconSize={18} tone="muted" onPress={handlers.add} />
                    </View>
                ) : null}
            </View>
            <View style={{ flexDirection: "row", gap: 2 }}>
                <IconButton testID="account-button" icon={MODERN_ICONS.account} label="Accounts" width={36} height={32} iconSize={20} onPress={handlers.accounts} />
                <IconButton testID="settings-button" icon={MODERN_ICONS.settings} label="Settings" width={36} height={32} iconSize={20} onPress={handlers.settings} />
            </View>
        </View>
    );
}
