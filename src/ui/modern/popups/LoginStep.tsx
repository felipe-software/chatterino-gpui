import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { number: number; text: string };

export function LoginStep({ number, text }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    return (
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: tokens.bgInput }}>
                <Text style={{ color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16, fontWeight: "600" }}>{String(number)}</Text>
            </View>
            <Text style={{ flexShrink: 1, color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 14, lineHeight: 24 }}>{text}</Text>
        </View>
    );
}
