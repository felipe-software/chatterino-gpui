import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { value: string; testID?: string };

export function SettingPathValue({ value, testID }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    return (
        <View
            testID={testID}
            style={{
                flex: 1,
                minWidth: 0,
                height: 32,
                justifyContent: "center",
                paddingHorizontal: 10,
                backgroundColor: tokens.bgChat,
                borderWidth: 1,
                borderColor: tokens.lineSubtle,
                borderRadius: 6,
            }}
        >
            <Text numberOfLines={1} style={{ color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>
                {value}
            </Text>
        </View>
    );
}
