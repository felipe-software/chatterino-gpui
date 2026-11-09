import { Text, View } from "@felipe-software/react-native-gpui";
import { MONO_FONT } from "./typography";
import { useModernTokens } from "./useModernTokens";

type Props = { text: string; size?: 12 | 13 };

export function Code({ text, size = 13 }: Props) {
    const tokens = useModernTokens();
    return (
        <View style={{ alignSelf: "flex-start", paddingVertical: 1, paddingHorizontal: 6, borderRadius: 4, backgroundColor: tokens.bgInput }}>
            <Text style={{ color: tokens.text, fontFamily: MONO_FONT, fontSize: size, lineHeight: size + 5 }}>{text}</Text>
        </View>
    );
}
