import { Text, View } from "@felipe-software/react-native-gpui";
import type { ModernTokens } from "../modern/tokens";
import { useApp } from "../state/AppContext";
import { SETTINGS_FONT_SIZE, SETTINGS_STYLE } from "./settingsStyle";
import { SPushButton } from "./SPushButton";

type Icon = "information" | "warning" | "critical" | "question";

type Props = {
    icon: Icon;
    text: string;
    informative?: string;
    buttons: Array<{ label: string; primary?: boolean; onPress: () => void }>;
};

const ICON_TEXT = { information: "i", warning: "!", critical: "✕", question: "?" } as const;
const ICON_COLOR = { information: "#2a82da", warning: "#e0a800", critical: "#e03131", question: "#2a82da" } as const;

function modernIconColor(tokens: ModernTokens, icon: Icon): string {
    if (icon === "warning") return tokens.warn;
    if (icon === "critical") return tokens.mention;
    return tokens.accent;
}

export function MessageBoxContent({ icon, text, informative, buttons }: Props) {
    const { theme, fonts } = useApp();
    const tokens = theme.modern;
    const label = tokens
        ? { color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 }
        : { color: SETTINGS_STYLE.text, fontFamily: fonts.appFamily, fontSize: SETTINGS_FONT_SIZE };
    const iconColor = tokens ? modernIconColor(tokens, icon) : ICON_COLOR[icon];
    const glyphColor = tokens ? tokens.onAccent : SETTINGS_STYLE.text;
    const padding = tokens ? 18 : 14;
    return (
        <View testID="message-box" style={{ flex: 1, padding, gap: 12 }}>
            <View style={{ flex: 1, flexDirection: "row", gap: 14 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: iconColor, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ ...label, color: glyphColor, fontSize: 20, lineHeight: undefined, fontWeight: "bold" }}>{ICON_TEXT[icon]}</Text>
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                    <Text testID="message-box-text" style={label}>
                        {text}
                    </Text>
                    {informative ? (
                        <Text testID="message-box-informative" style={tokens ? { ...label, color: tokens.text2 } : label}>
                            {informative}
                        </Text>
                    ) : null}
                </View>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: tokens ? 8 : 6 }}>
                {buttons.map((button) => (
                    <SPushButton key={button.label} testID={`message-box-${button.label.toLowerCase()}`} label={button.label} primary={button.primary} onPress={button.onPress} />
                ))}
            </View>
        </View>
    );
}
