import { Svg, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { HoverLayer } from "../controls/HoverLayer";
import { CONTROL_ICONS } from "../controls/icons";
import { usePressState } from "../controls/usePressState";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { testID: string; label: string; selected: boolean; onPress: () => void };

export function OptionRow({ testID, label, selected, onPress }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const press = usePressState();
    return (
        <View
            testID={testID}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            style={{
                height: 34,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                paddingHorizontal: 10,
                borderRadius: 6,
                backgroundColor: selected ? tokens.accentSoft : undefined,
                cursor: "pointer",
            }}
            {...press.handlers}
            onClick={onPress}
        >
            {selected ? null : <HoverLayer hovered={press.hovered} pressed={press.pressed} color={tokens.bgHover} />}
            <Text style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18, fontWeight: selected ? "600" : "400" }}>{label}</Text>
            {selected ? <Svg name={CONTROL_ICONS.checkMark} style={{ width: 15, height: 15, color: tokens.accent }} /> : null}
        </View>
    );
}
