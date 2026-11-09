import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { MODERN_FONT, type ModernTokens } from "../tokens";

type Props = {
    tokens: ModernTokens;
    title: string;
    description?: string;
};

export function SettingsPageHeader({ tokens, title, description }: Props) {
    const { fonts } = useApp();
    const family = fonts.uiFamily || MODERN_FONT;
    return (
        <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: family, fontSize: 22, lineHeight: 28, fontWeight: "600", color: tokens.text }}>{title}</Text>
            {description ? <Text style={{ fontFamily: family, fontSize: 14, lineHeight: 20, color: tokens.text2 }}>{description}</Text> : null}
        </View>
    );
}
