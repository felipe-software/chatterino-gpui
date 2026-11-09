import { Svg, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { ChoiceIndicator } from "./ChoiceIndicator";
import { CONTROL_ICONS } from "./icons";
import { useModernTokens } from "./useModernTokens";
import { usePressState } from "./usePressState";

type Props = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    mixed?: boolean;
    testID?: string;
};

export function Checkbox({ checked, onChange, label, disabled = false, mixed = false, testID }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const press = usePressState(disabled);
    const on = checked || mixed;
    const mark = mixed ? (
        <View style={{ width: 8, height: 2.5, borderRadius: 2, backgroundColor: tokens.onAccent }} />
    ) : (
        <Svg name={CONTROL_ICONS.checkBold} style={{ width: 12, height: 12, color: tokens.onAccent }} />
    );
    return (
        <View
            testID={testID}
            accessibilityRole="checkbox"
            accessibilityLabel={label}
            accessibilityState={{ checked: mixed ? "mixed" : checked, disabled }}
            style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                gap: 8,
                minHeight: 22,
                opacity: disabled ? 0.45 : 1,
                cursor: disabled ? "default" : "pointer",
            }}
            {...press.handlers}
            onClick={disabled ? undefined : () => onChange(!checked)}
        >
            <ChoiceIndicator on={on} hovered={press.hovered} mark={mark} />
            {label ? (
                <Text style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 }}>{label}</Text>
            ) : null}
        </View>
    );
}
