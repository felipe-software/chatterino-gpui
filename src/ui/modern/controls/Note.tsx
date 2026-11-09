import { Svg, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "./useModernTokens";

type Props = { icon: string; text: string; link?: { label: string; onPress: () => void }; testID?: string };

export function Note({ icon, text, link, testID }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const textStyle = { color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 };
    return (
        <View testID={testID} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            <Svg name={icon} style={{ width: 16, height: 16, marginTop: 1, color: tokens.text3 }} />
            <Text style={{ ...textStyle, flex: 1, minWidth: 0 }}>
                {text}
                {link ? " " : null}
                {link ? (
                    <Text style={{ ...textStyle, color: tokens.accent }} onPress={() => link.onPress()}>
                        {link.label}
                    </Text>
                ) : null}
            </Text>
        </View>
    );
}
