import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { label: string; hint?: string; disabled?: boolean };

export function SettingLabel({ label, hint, disabled }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const labelColor = disabled ? tokens.text3 : tokens.text;
    return (
        <View style={{ gap: 2, minWidth: 0 }}>
            <Text style={{ color: labelColor, fontFamily: fonts.uiFamily, fontSize: 14, lineHeight: 20, fontWeight: "500" }}>{label}</Text>
            {hint ? <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>{hint}</Text> : null}
        </View>
    );
}
