import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { title: string; count: number };

export function EmoteSectionHeader({ title, count }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const text = { fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 };
    return (
        <View style={{ height: 16, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4 }}>
            <Text numberOfLines={1} style={{ ...text, flexShrink: 1, color: tokens.text2, fontWeight: "600" }}>
                {title}
            </Text>
            <Text style={{ ...text, color: tokens.text3 }}>{String(count)}</Text>
        </View>
    );
}
