import { Text } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { value: string; testID?: string };

export function SettingValueText({ value, testID }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    return (
        <Text testID={testID} numberOfLines={1} style={{ color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 }}>
            {value}
        </Text>
    );
}
