import { ScrollView, View } from "@felipe-software/react-native-gpui";
import { SettingsSearchField } from "../../settings/SettingsSearchField";
import { Divider } from "../controls/Divider";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_NAV_GROUPS, type ModernPageName } from "./modernSettingsPages";
import { SettingsNavGroup } from "./SettingsNavGroup";
import { SettingsNavItem } from "./SettingsNavItem";

type Props = {
    selected: ModernPageName;
    visible: ModernPageName[];
    query: string;
    onQueryChange: (query: string) => void;
    onSelect: (page: ModernPageName) => void;
};

export const SETTINGS_NAV_WIDTH = 233;

export function SettingsNav({ selected, visible, query, onQueryChange, onSelect }: Props) {
    const tokens = useModernTokens();
    const groups = MODERN_NAV_GROUPS.map((group) => ({ ...group, pages: group.pages.filter((page) => visible.includes(page)) })).filter(
        (group) => group.pages.length > 0,
    );
    const showAbout = visible.includes("About");
    return (
        <View testID="settings-nav" style={{ width: SETTINGS_NAV_WIDTH, backgroundColor: tokens.bgWindow, borderRightWidth: 1, borderRightColor: tokens.lineSubtle }}>
            <ScrollView testID="settings-nav-scroll" style={{ flex: 1 }}>
                <View style={{ paddingTop: 14, paddingHorizontal: 10, paddingBottom: 16, gap: 16 }}>
                    <SettingsSearchField value={query} onChange={onQueryChange} />
                    <View accessibilityLabel="Settings sections" style={{ gap: 14 }}>
                        {groups.map((group) => (
                            <SettingsNavGroup key={group.title} title={group.title} pages={group.pages} selected={selected} onSelect={onSelect} />
                        ))}
                        {showAbout ? (
                            <View>
                                <Divider />
                                <View style={{ paddingTop: 10 }}>
                                    <SettingsNavItem page="About" selected={selected === "About"} onSelect={() => onSelect("About")} />
                                </View>
                            </View>
                        ) : null}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
