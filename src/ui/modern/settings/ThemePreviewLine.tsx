import type { ReactNode } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { time: string; badge: string; name: string; nameColor: string; highlighted?: boolean; children: ReactNode };

export function ThemePreviewLine({ time, badge, name, nameColor, highlighted, children }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const verticalPadding = highlighted ? 6 : 4;
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: verticalPadding,
                paddingHorizontal: 14,
                backgroundColor: highlighted ? tokens.mentionTint : undefined,
            }}
        >
            <Text style={{ marginRight: 6, color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 20 }}>{time}</Text>
            <View accessibilityRole="image" accessibilityLabel={badge} style={{ width: 18, height: 18, marginRight: 4, borderRadius: 3, backgroundColor: tokens.slot }} />
            <Text style={{ flex: 1, color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 14, lineHeight: 20 }}>
                <Text style={{ fontWeight: "600", color: nameColor }}>{name}</Text>
                <Text style={{ color: tokens.text3 }}>:</Text>
                {children}
            </Text>
        </View>
    );
}
