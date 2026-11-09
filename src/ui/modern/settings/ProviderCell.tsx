import { Text, View } from "@felipe-software/react-native-gpui";
import { unsupportedTooltip } from "../../settings/generalHelpers";
import type { GeneralItem, SettingsAccess } from "../../settings/generalTypes";
import { useSettingsTooltip } from "../../settings/useSettingsTooltip";
import { useApp } from "../../state/AppContext";
import { Switch } from "../controls/Switch";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { item: GeneralItem | undefined; label: string; access: SettingsAccess };

const NOT_OFFERED = "Not offered by this provider";

function tooltipOf(item: GeneralItem | undefined): string {
    if (item?.kind !== "checkbox") return NOT_OFFERED;
    return unsupportedTooltip(item.tooltip, item.unsupported) ?? "";
}

export function ProviderCell({ item, label, access }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const hover = useSettingsTooltip(tooltipOf(item) || undefined);
    return (
        <View style={{ flex: 1, minWidth: 0, alignItems: "flex-start" }} {...hover}>
            {item?.kind === "checkbox" ? (
                <Switch testID={`setting-${item.id}`} size="sm" label={label} value={item.get(access)} onChange={(value) => item.set(access, value)} />
            ) : (
                <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 }}>—</Text>
            )}
        </View>
    );
}
