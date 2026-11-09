import { useState } from "react";
import { Svg, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { FadeLayer } from "../controls/FadeLayer";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { testID: string; icon: string; title: string; description: string; onPress: () => void };

export function AboutLinkCard({ testID, icon, title, description, onPress }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const [hovered, setHovered] = useState(false);
    return (
        <View
            testID={testID}
            accessibilityRole="link"
            accessibilityLabel={title}
            style={{
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: 0,
                minWidth: 0,
                gap: 6,
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: tokens.lineSubtle,
                backgroundColor: tokens.bgRaised,
                cursor: "pointer",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onPress}
        >
            <FadeLayer visible={hovered} color={tokens.bgHover} borderColor={tokens.lineStrong} borderWidth={1} outset={1} radius={10} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Svg name={icon} style={{ width: 17, height: 17, color: tokens.accent }} />
                <Text style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 14, lineHeight: 20, fontWeight: "600" }}>{title}</Text>
            </View>
            <Text style={{ minWidth: 0, color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 }}>{description}</Text>
        </View>
    );
}
