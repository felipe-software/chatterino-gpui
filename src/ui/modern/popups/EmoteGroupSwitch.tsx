import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { Switch } from "../controls/Switch";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { value: boolean; disabled: boolean; onChange: (value: boolean) => void };

const LABEL = "Group by name";

export function EmoteGroupSwitch({ value, disabled, onChange }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, opacity: disabled ? 0.45 : 1 }}>
            <Text
                style={{ color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16, cursor: disabled ? "default" : "pointer" }}
                onPress={disabled ? undefined : () => onChange(!value)}
            >
                {LABEL}
            </Text>
            <Switch testID="emote-group-toggle" label={LABEL} size="sm" value={value} disabled={disabled} onChange={onChange} />
        </View>
    );
}
