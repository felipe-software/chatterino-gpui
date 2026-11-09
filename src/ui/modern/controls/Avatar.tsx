import { Image, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "./useModernTokens";

type Props = { name: string; uri?: string; size?: number; color?: string; borderColor?: string; borderWidth?: number };

const INITIAL_SCALE = 0.37;

export function Avatar({ name, uri, size = 36, color, borderColor, borderWidth = 1 }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const initial = name.trim().charAt(0).toUpperCase();
    const fontSize = Math.round(size * INITIAL_SCALE);
    return (
        <View
            accessibilityRole="image"
            accessibilityLabel={name}
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                overflow: "hidden",
                borderWidth,
                borderColor: borderColor ?? tokens.lineStrong,
                backgroundColor: tokens.bgInput,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {uri ? (
                <Image source={{ uri }} style={{ width: size - borderWidth * 2, height: size - borderWidth * 2, borderRadius: size / 2 }} resizeMode="cover" />
            ) : (
                <Text style={{ color: color ?? tokens.text2, fontFamily: fonts.uiFamily, fontSize, lineHeight: Math.round(fontSize * 1.3), fontWeight: "600" }}>
                    {initial}
                </Text>
            )}
        </View>
    );
}
