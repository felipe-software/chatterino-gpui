import { Svg, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { Button } from "../controls/Button";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_ICONS } from "../icons";

type Props = { version: string; details: string; onCopy: () => void };

export function AboutHeader({ version, details, onCopy }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
            <View
                accessibilityRole="image"
                accessibilityLabel="Chatterino"
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: tokens.lineStrong,
                    backgroundColor: tokens.bgInput,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Svg name={MODERN_ICONS.chat} style={{ width: 28, height: 28, color: tokens.accent }} />
            </View>
            <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 260, minWidth: 0, gap: 2 }}>
                <Text style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 22, lineHeight: 28, fontWeight: "600" }}>Chatterino</Text>
                <Text testID="about-version" style={{ color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 }}>
                    {version}
                </Text>
                <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>{details}</Text>
            </View>
            <Button testID="about-copy-version" label="Copy version info" icon={MODERN_ICONS.copy} onPress={onCopy} />
        </View>
    );
}
