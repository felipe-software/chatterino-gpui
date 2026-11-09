import { View } from "@felipe-software/react-native-gpui";
import { useModernTokens } from "./useModernTokens";

type Props = { size?: number };

export function LiveDot({ size = 7 }: Props) {
    const tokens = useModernTokens();
    return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tokens.live }} />;
}
