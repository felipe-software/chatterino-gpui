import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "./useModernTokens";

type Props = { label: string; size?: "sm" | "md" };

export function Kbd({ label, size = "md" }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    if (size === "sm") {
        return (
            <View style={{ paddingHorizontal: 5, borderWidth: 1, borderColor: tokens.lineStrong, borderRadius: 4 }}>
                <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 11, lineHeight: 16, fontWeight: "600" }}>{label}</Text>
            </View>
        );
    }
    return (
        <View
            style={{
                height: 24,
                justifyContent: "center",
                paddingHorizontal: 7,
                borderWidth: 1,
                borderBottomWidth: 2,
                borderColor: tokens.lineStrong,
                borderRadius: 5,
                backgroundColor: tokens.bgInput,
            }}
        >
            <Text style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16, fontWeight: "600" }}>{label}</Text>
        </View>
    );
}
