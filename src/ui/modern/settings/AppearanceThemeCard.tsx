import { Fragment } from "react";
import { View } from "@felipe-software/react-native-gpui";
import type { SettingsAccess } from "../../settings/generalTypes";
import { Divider } from "../controls/Divider";
import { useModernTokens } from "../controls/useModernTokens";
import { AccentRow } from "./AccentRow";
import { ACCENT_ITEM_ID, LIGHT_ALIAS, THEME_ITEM_ID, THEME_TILES, type ModernBlock } from "./modernGeneralPages";
import { ModernItemRow } from "./ModernItemRow";
import { displayValue, dropdownItem, type ItemIndex } from "./modernRows";
import { SettingsCard } from "./SettingsCard";
import { ThemePreview } from "./ThemePreview";
import { ThemeTile } from "./ThemeTile";

type Props = { block: Extract<ModernBlock, { kind: "theme" }>; items: ItemIndex; access: SettingsAccess };

const SYSTEM = "system";

export function AppearanceThemeCard({ block, items, access }: Props) {
    const tokens = useModernTokens();
    const themeItem = dropdownItem(items, THEME_ITEM_ID);
    const accentItem = dropdownItem(items, ACCENT_ITEM_ID);
    if (!themeItem || !accentItem) return null;
    const current = displayValue(themeItem.get(access), { valueAlias: LIGHT_ALIAS });
    const followsSystem = current === SYSTEM;
    const rows = followsSystem ? [...block.system, ...block.rows] : block.rows;
    return (
        <>
            <SettingsCard tokens={tokens}>
                <View testID="settings-theme-tiles" accessibilityRole="radiogroup" accessibilityLabel="Theme" style={{ flexDirection: "row", gap: 12, padding: 16 }}>
                    {THEME_TILES.map((tile) => (
                        <ThemeTile
                            key={tile.value}
                            value={tile.value}
                            label={tile.label}
                            selected={tile.value === current}
                            accent={access.settings.accentColor}
                            onSelect={() => themeItem.set(access, tile.value)}
                        />
                    ))}
                </View>
                <Divider />
                <AccentRow item={accentItem} access={access} />
                {rows.map((spec) => {
                    const item = items.get(spec.id);
                    if (!item) return null;
                    return (
                        <Fragment key={spec.id}>
                            <Divider />
                            <ModernItemRow item={item} spec={spec} access={access} />
                        </Fragment>
                    );
                })}
            </SettingsCard>
            <ThemePreview />
        </>
    );
}
