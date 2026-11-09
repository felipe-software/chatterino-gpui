import { useMemo } from "react";
import { ScrollView, View } from "@felipe-software/react-native-gpui";
import { generalItems } from "../../settings/generalOptions";
import { useSettingsUi } from "../../settings/SettingsContext";
import { useSettingsAccess } from "../../settings/useSettingsAccess";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_GENERAL } from "./modernGeneralPages";
import { ModernSectionView } from "./ModernSectionView";
import { indexItems } from "./modernRows";
import { filterModernPage } from "./modernSearch";
import type { ModernGeneralPageName } from "./modernSettingsPages";
import { SettingsPageHeader } from "./SettingsPageHeader";

type Props = { name: ModernGeneralPageName };

export function ModernGeneralPage({ name }: Props) {
    const tokens = useModernTokens();
    const access = useSettingsAccess();
    const { query } = useSettingsUi();
    const items = useMemo(() => indexItems(generalItems()), []);
    const page = MODERN_GENERAL[name];
    const filters = filterModernPage(page, items, query);
    const testName = name.toLowerCase().replace(/ /g, "-");
    return (
        <ScrollView key={name} testID={`settings-${testName}-scroll`} style={{ flex: 1 }}>
            <View testID={`settings-${testName}`} style={{ maxWidth: 720, paddingTop: 28, paddingHorizontal: 40, paddingBottom: 48, gap: 32 }}>
                <SettingsPageHeader tokens={tokens} title={page.name} description={page.description} />
                {page.sections.map((section, index) => (
                    <ModernSectionView key={section.title} section={section} filter={filters[index]} items={items} access={access} />
                ))}
            </View>
        </ScrollView>
    );
}
