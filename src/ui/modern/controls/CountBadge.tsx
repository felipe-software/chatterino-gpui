import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import type { ModernTokens } from "../tokens";
import { useModernTokens } from "./useModernTokens";

export type CountBadgeTone = "mention" | "accent" | "neutral";

type Props = { count: number | string; tone?: CountBadgeTone; testID?: string };

type Paint = { background: string; text: string };

function badgePaint(tokens: ModernTokens, tone: CountBadgeTone): Paint {
    if (tone === "accent") return { background: tokens.accent, text: tokens.onAccent };
    if (tone === "neutral") return { background: tokens.bgInput, text: tokens.text2 };
    return { background: tokens.mention, text: tokens.bgChat };
}

export function CountBadge({ count, tone = "mention", testID }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const colors = badgePaint(tokens, tone);
    return (
        <View
            testID={testID}
            style={{
                minWidth: 18,
                height: 18,
                paddingHorizontal: 5,
                borderRadius: 9,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.background,
            }}
        >
            <Text style={{ color: colors.text, fontFamily: fonts.uiFamily, fontSize: 11, lineHeight: 18, fontWeight: "700", textAlign: "center" }}>
                {String(count)}
            </Text>
        </View>
    );
}
