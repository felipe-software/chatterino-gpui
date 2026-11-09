import type { ReactNode } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "./useModernTokens";

type Props = { hint?: string; tone?: "chat" | "window"; children: ReactNode };

export function DialogFooter({ hint, tone = "chat", children }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const windowTone = tone === "window";
    const spacing = windowTone ? { height: 56, paddingLeft: 20, paddingRight: 16, gap: 12 } : { paddingVertical: 12, paddingHorizontal: 14, gap: 8 };
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: hint ? "space-between" : "flex-end",
                ...spacing,
                borderTopWidth: 1,
                borderTopColor: tokens.lineSubtle,
                backgroundColor: windowTone ? tokens.bgWindow : tokens.bgChat,
            }}
        >
            {hint ? (
                <Text numberOfLines={1} style={{ flexShrink: 1, color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>
                    {hint}
                </Text>
            ) : null}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>{children}</View>
        </View>
    );
}
