import { View } from "@felipe-software/react-native-gpui";
import type { SettingsAccess } from "../../settings/generalTypes";
import { ACCENT_NAMES } from "../tokens";
import { AccentSwatch } from "./AccentSwatch";
import type { DropdownItem } from "./modernRows";
import { SettingLabel } from "./SettingLabel";

type Props = { item: DropdownItem; access: SettingsAccess };

export function AccentRow({ item, access }: Props) {
    const value = item.get(access);
    const labelOf = (name: string) => item.options.find((option) => option.value === name)?.label ?? name;
    const accents = ACCENT_NAMES.filter((name) => item.options.some((option) => option.value === name));
    const hint = `Links, focus rings, switches and primary buttons. ${labelOf(value)} selected.`;
    return (
        <View
            testID={`setting-row-${item.id}`}
            style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 16, rowGap: 12, minHeight: 60, paddingVertical: 12, paddingHorizontal: 16 }}
        >
            <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 200, minWidth: 0 }}>
                <SettingLabel label={item.label} hint={hint} />
            </View>
            <View testID={`setting-${item.id}`} accessibilityRole="radiogroup" accessibilityLabel={item.label} style={{ flexDirection: "row", gap: 10 }}>
                {accents.map((name) => (
                    <AccentSwatch key={name} accent={name} label={labelOf(name)} selected={name === value} onSelect={() => item.set(access, name)} />
                ))}
            </View>
        </View>
    );
}
