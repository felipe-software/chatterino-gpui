import type { ReactNode } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "./useModernTokens";

type Props = { label: string; hint?: string; error?: string; children: ReactNode; testID?: string };

export function Field({ label, hint, error, children, testID }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const note = error ?? hint;
    return (
        <View testID={testID} style={{ gap: 6 }}>
            <Text style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18, fontWeight: "500" }}>{label}</Text>
            {children}
            {note ? (
                <Text style={{ color: error ? tokens.mention : tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>{note}</Text>
            ) : null}
        </View>
    );
}
