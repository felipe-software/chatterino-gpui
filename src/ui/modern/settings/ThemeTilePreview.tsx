import { View, type DimensionValue } from "@felipe-software/react-native-gpui";
import type { AccentName } from "../../../data/api";
import { modernTokens, type ModernScheme } from "../tokens";
import { previewNames } from "./previewColors";

type Props = { scheme: ModernScheme; accent: AccentName };

function bar(width: DimensionValue, color: string) {
    return <View style={{ width, height: 4, borderRadius: 2, backgroundColor: color }} />;
}

export function ThemeTilePreview({ scheme, accent }: Props) {
    const tokens = modernTokens(scheme, accent);
    const names = previewNames(tokens);
    return (
        <View style={{ height: 84, borderRadius: 8, overflow: "hidden", backgroundColor: tokens.bgChat }}>
            <View style={{ height: 16, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, backgroundColor: tokens.bgWindow }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: tokens.live }} />
                {bar(26, tokens.text3)}
                {bar(18, tokens.lineStrong)}
            </View>
            <View style={{ flex: 1, justifyContent: "center", gap: 6, paddingHorizontal: 8 }}>
                <View style={{ flexDirection: "row", gap: 4 }}>
                    {bar(18, names.orbit)}
                    {bar("52%", tokens.text2)}
                </View>
                <View style={{ flexDirection: "row", gap: 4, padding: 4, marginHorizontal: -4, borderRadius: 3, backgroundColor: tokens.mentionTint }}>
                    {bar(18, names.brisk)}
                    {bar("40%", tokens.text2)}
                </View>
                <View style={{ flexDirection: "row", gap: 4 }}>
                    {bar(18, names.lumen)}
                    {bar("30%", tokens.accent)}
                </View>
            </View>
            <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, borderRadius: 8, borderWidth: 1, borderColor: tokens.lineSubtle }} />
        </View>
    );
}
