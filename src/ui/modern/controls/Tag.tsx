import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "./useModernTokens";

type Props = { label: string; tone?: "accent" | "neutral"; testID?: string };

export function Tag({ label, tone = "accent", testID }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const color = tone === "accent" ? tokens.accent : tokens.text3;
    const border = tone === "accent" ? tokens.accent : tokens.lineStrong;
    return (
        <View testID={testID} style={{ alignSelf: "center", paddingHorizontal: 7, borderWidth: 1, borderColor: border, borderRadius: 999 }}>
            <Text numberOfLines={1} style={{ color, fontFamily: fonts.uiFamily, fontSize: 11, lineHeight: 16, fontWeight: "600" }}>
                {label}
            </Text>
        </View>
    );
}
