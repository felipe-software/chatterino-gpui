import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { label: string; value: string; testID?: string };

export function UserStat({ label, value, testID }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    return (
        <View testID={testID} style={{ flex: 1, minWidth: 0, gap: 2, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, backgroundColor: tokens.bgChat }}>
            <Text numberOfLines={1} style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 11, lineHeight: 14 }}>
                {label}
            </Text>
            <Text numberOfLines={1} style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 14, lineHeight: 18, fontWeight: "600" }}>
                {value}
            </Text>
        </View>
    );
}
