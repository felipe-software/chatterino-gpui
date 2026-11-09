import { Svg, Text, View } from "@felipe-software/react-native-gpui";
import { ICONS } from "../icons";
import { Checkbox } from "../modern/controls/Checkbox";
import { useApp } from "../state/AppContext";
import { menuColors } from "../theme";
import { matchesQuery, useSettingsUi } from "./SettingsContext";
import { SETTINGS_FONT_SIZE, SETTINGS_STYLE } from "./settingsStyle";
import { useSettingsTooltip } from "./useSettingsTooltip";

type Props = {
    label: string;
    checked: boolean;
    testID?: string;
    tooltip?: string;
    disabled?: boolean;
    greyable?: boolean;
    onChange: (checked: boolean) => void;
};

export function SCheckBox({ label, checked, testID, tooltip, disabled, greyable = true, onChange }: Props) {
    const { theme, fonts } = useApp();
    const { query } = useSettingsUi();
    const hover = useSettingsTooltip(tooltip);

    if (theme.modern) {
        return (
            <View style={{ alignSelf: "flex-start" }} {...hover}>
                <Checkbox testID={testID} label={label} checked={checked} disabled={disabled} onChange={onChange} />
            </View>
        );
    }

    const colors = menuColors(theme);
    const greyed = greyable && !matchesQuery(query, label);
    const textColor = disabled ? SETTINGS_STYLE.disabledText : SETTINGS_STYLE.text;
    const markColor = disabled ? SETTINGS_STYLE.disabledText : colors.checkMark;
    return (
        <View
            testID={testID}
            accessibilityRole="checkbox"
            accessibilityLabel={label}
            accessibilityState={{ checked, disabled }}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 23, alignSelf: "flex-start" }}
            onClick={disabled ? undefined : () => onChange(!checked)}
            {...hover}
        >
            <View
                style={{
                    width: 14,
                    height: 14,
                    borderWidth: 1,
                    borderColor: colors.checkBorder,
                    borderRadius: 2,
                    backgroundColor: colors.checkFill,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {checked ? <Svg name={ICONS.check} style={{ width: 12, height: 12, color: markColor }} /> : null}
            </View>
            <Text style={{ color: textColor, fontFamily: fonts.appFamily, fontSize: SETTINGS_FONT_SIZE }}>{label}</Text>
            {greyed ? <View style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, backgroundColor: SETTINGS_STYLE.greyOut }} /> : null}
        </View>
    );
}
