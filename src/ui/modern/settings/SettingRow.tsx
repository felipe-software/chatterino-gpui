import type { ReactNode } from "react";
import { View, type ViewStyle } from "@felipe-software/react-native-gpui";
import { useSettingsTooltip } from "../../settings/useSettingsTooltip";
import { SettingLabel } from "./SettingLabel";

type Props = {
    label: string;
    hint?: string;
    tooltip?: string;
    disabled?: boolean;
    stacked?: boolean;
    testID?: string;
    children?: ReactNode;
};

const CONTROL: ViewStyle = { flexShrink: 0, flexDirection: "row", alignItems: "center", gap: 8 };
const STACKED: ViewStyle = { flexBasis: "100%", flexGrow: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 8 };

export function SettingRow({ label, hint, tooltip, disabled, stacked, testID, children }: Props) {
    const hover = useSettingsTooltip(tooltip);
    return (
        <View
            testID={testID}
            style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 16, rowGap: 8, minHeight: 52, paddingVertical: 10, paddingHorizontal: 16 }}
        >
            <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 240, minWidth: 0 }} {...hover}>
                <SettingLabel label={label} hint={hint} disabled={disabled} />
            </View>
            {children ? <View style={stacked ? STACKED : CONTROL}>{children}</View> : null}
        </View>
    );
}
