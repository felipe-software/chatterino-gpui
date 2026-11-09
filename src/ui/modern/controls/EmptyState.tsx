import type { ReactNode } from "react";
import { Svg, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "./useModernTokens";

type Props = { title: string; description?: string; icon?: string; bordered?: boolean; children?: ReactNode; testID?: string };

export function EmptyState({ title, description, icon, bordered = false, children, testID }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const cardStyle = bordered
        ? { paddingVertical: 40, paddingHorizontal: 24, gap: 10, borderWidth: 1, borderStyle: "dashed" as const, borderColor: tokens.lineStrong, borderRadius: 10, backgroundColor: tokens.bgRaised }
        : { flex: 1, padding: 24, gap: 8 };
    return (
        <View testID={testID} style={{ alignItems: "center", justifyContent: "center", ...cardStyle }}>
            {icon ? (
                <View style={{ width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: tokens.bgInput }}>
                    <Svg name={icon} style={{ width: 20, height: 20, color: tokens.text2 }} />
                </View>
            ) : null}
            <Text style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 14, lineHeight: 20, fontWeight: "600", textAlign: "center" }}>{title}</Text>
            {description ? (
                <Text style={{ maxWidth: bordered ? 380 : 280, color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18, textAlign: "center" }}>
                    {description}
                </Text>
            ) : null}
            {children ? <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>{children}</View> : null}
        </View>
    );
}
