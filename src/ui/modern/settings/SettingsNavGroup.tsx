import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";
import type { ModernPageName } from "./modernSettingsPages";
import { SettingsNavItem } from "./SettingsNavItem";

type Props = { title: string; pages: ModernPageName[]; selected: ModernPageName; onSelect: (page: ModernPageName) => void };

export function SettingsNavGroup({ title, pages, selected, onSelect }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    return (
        <View testID={`settings-nav-group-${title}`} style={{ gap: 1 }}>
            <Text style={{ paddingHorizontal: 10, paddingBottom: 4, color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16, fontWeight: "600" }}>
                {title}
            </Text>
            {pages.map((page) => (
                <SettingsNavItem key={page} page={page} selected={page === selected} onSelect={() => onSelect(page)} />
            ))}
        </View>
    );
}
