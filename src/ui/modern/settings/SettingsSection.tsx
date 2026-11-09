import type { ReactNode } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { MODERN_FONT, type ModernTokens } from "../tokens";

type Props = {
    tokens: ModernTokens;
    title?: string;
    children: ReactNode;
};

export function SettingsSection({ tokens, title, children }: Props) {
    const { fonts } = useApp();
    const family = fonts.uiFamily || MODERN_FONT;
    return (
        <View style={{ gap: 10 }}>
            {title ? <Text style={{ fontFamily: family, fontSize: 15, lineHeight: 20, fontWeight: "600", color: tokens.text }}>{title}</Text> : null}
            {children}
        </View>
    );
}
