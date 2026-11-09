import { View } from "@felipe-software/react-native-gpui";
import { useModernTokens } from "./useModernTokens";

type Props = { vertical?: boolean; inset?: number };

export function Divider({ vertical = false, inset = 0 }: Props) {
    const tokens = useModernTokens();
    if (vertical) {
        return <View style={{ width: 1, alignSelf: "stretch", marginVertical: inset, backgroundColor: tokens.lineSubtle }} />;
    }
    return <View style={{ height: 1, alignSelf: "stretch", marginHorizontal: inset, backgroundColor: tokens.lineSubtle }} />;
}
