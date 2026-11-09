import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { ChoiceIndicator } from "./ChoiceIndicator";
import { useModernTokens } from "./useModernTokens";
import { usePressState } from "./usePressState";

type Props = {
    selected: boolean;
    onSelect: () => void;
    label?: string;
    description?: string;
    disabled?: boolean;
    hovered?: boolean;
    testID?: string;
};

export function Radio({ selected, onSelect, label, description, disabled = false, hovered, testID }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const press = usePressState(disabled);
    return (
        <View
            testID={testID}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ selected, disabled }}
            style={{
                flexDirection: "row",
                alignItems: description ? "flex-start" : "center",
                alignSelf: "flex-start",
                gap: 10,
                minHeight: 22,
                opacity: disabled ? 0.45 : 1,
                cursor: disabled ? "default" : "pointer",
            }}
            {...press.handlers}
            onClick={disabled ? undefined : onSelect}
        >
            <View style={{ marginTop: description ? 1 : 0 }}>
                <ChoiceIndicator
                    on={selected}
                    round
                    hovered={!disabled && (hovered ?? press.hovered)}
                    mark={<View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: tokens.onAccent }} />}
                />
            </View>
            {label ? (
                <View style={{ flexShrink: 1, gap: 1 }}>
                    <Text style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 20, fontWeight: "500" }}>{label}</Text>
                    {description ? (
                        <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>{description}</Text>
                    ) : null}
                </View>
            ) : null}
        </View>
    );
}
