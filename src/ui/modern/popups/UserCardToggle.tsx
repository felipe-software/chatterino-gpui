import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { Switch } from "../controls/Switch";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { label: string; value: boolean; disabled?: boolean; testID: string; onChange: (value: boolean) => void };

export function UserCardToggle({ label, value, disabled = false, testID, onChange }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const toggle = disabled ? undefined : () => onChange(!value);
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            <Switch testID={testID} label={label} size="sm" value={value} disabled={disabled} onChange={onChange} />
            <Text
                style={{
                    color: disabled ? tokens.text3 : tokens.text2,
                    fontFamily: fonts.uiFamily,
                    fontSize: 12,
                    lineHeight: 16,
                    cursor: disabled ? "default" : "pointer",
                }}
                onPress={toggle}
            >
                {label}
            </Text>
        </View>
    );
}
