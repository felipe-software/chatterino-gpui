import type { ReactNode } from "react";
import { View } from "@felipe-software/react-native-gpui";
import type { ModernTokens } from "../tokens";

type Props = {
    tokens: ModernTokens;
    children: ReactNode;
};

export function SettingsCard({ tokens, children }: Props) {
    return (
        <View style={{ backgroundColor: tokens.bgRaised, borderWidth: 1, borderColor: tokens.lineSubtle, borderRadius: 10, overflow: "hidden" }}>
            {children}
        </View>
    );
}
