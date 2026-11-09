import { View } from "@felipe-software/react-native-gpui";
import type { AccentName } from "../../../data/api";
import { modernTokens, type ModernScheme } from "../tokens";

type Props = { accent: AccentName; frame: string };

const HALVES: ModernScheme[] = ["dark", "light"];

export function SystemThemeTilePreview({ accent, frame }: Props) {
    return (
        <View style={{ height: 84, flexDirection: "row", borderRadius: 8, overflow: "hidden" }}>
            {HALVES.map((scheme) => {
                const tokens = modernTokens(scheme, accent);
                return (
                    <View key={scheme} style={{ flex: 1, backgroundColor: tokens.bgChat }}>
                        <View style={{ height: 16, backgroundColor: tokens.bgWindow }} />
                        <View style={{ flex: 1, justifyContent: "center", gap: 6, paddingHorizontal: 8 }}>
                            <View style={{ width: "70%", height: 4, borderRadius: 2, backgroundColor: tokens.text2 }} />
                            <View style={{ width: "50%", height: 4, borderRadius: 2, backgroundColor: tokens.accent }} />
                        </View>
                    </View>
                );
            })}
            <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, borderRadius: 8, borderWidth: 1, borderColor: frame }} />
        </View>
    );
}
