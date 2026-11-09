import { Svg, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { MODERN_ICONS } from "../icons";
import type { ModernTokens } from "../tokens";
import { CONTROL_ICONS } from "./icons";
import { IconButton } from "./IconButton";
import { useModernTokens } from "./useModernTokens";

export type CalloutTone = "info" | "warning" | "error" | "success";

type Props = {
    tone: CalloutTone;
    title?: string;
    description?: string;
    lines?: string[];
    size?: "md" | "lg";
    onClose?: () => void;
    testID?: string;
};

type Paint = { background: string; border: string; icon: string; glyph: string };

function calloutPaint(tokens: ModernTokens, tone: CalloutTone): Paint {
    switch (tone) {
        case "warning":
            return { background: tokens.warnTint, border: tokens.warnLine, icon: tokens.warn, glyph: CONTROL_ICONS.warning };
        case "error":
            return { background: tokens.dangerTint, border: tokens.dangerLine, icon: tokens.mention, glyph: CONTROL_ICONS.error };
        case "success":
            return { background: tokens.firstTint, border: tokens.lineSubtle, icon: tokens.success, glyph: CONTROL_ICONS.success };
        default:
            return { background: tokens.infoTint, border: tokens.lineSubtle, icon: tokens.accent, glyph: CONTROL_ICONS.info };
    }
}

export function Callout({ tone, title, description, lines, size = "md", onClose, testID }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const colors = calloutPaint(tokens, tone);
    const large = size === "lg";
    const iconSize = large ? 18 : 17;
    const sidePadding = large ? 16 : 14;
    const rightPadding = onClose ? 6 : sidePadding;
    const body = [...(description ? [description] : []), ...(lines ?? [])];
    const titleStyle = { color: tokens.text, fontFamily: fonts.uiFamily, fontSize: large ? 14 : 13, lineHeight: large ? 20 : 18, fontWeight: "600" as const };
    const bodyStyle = { color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: large ? 13 : 12, lineHeight: large ? 18 : 16 };
    return (
        <View
            testID={testID}
            accessibilityRole={tone === "error" ? "alert" : undefined}
            style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: large ? 12 : 10,
                paddingVertical: large ? 14 : 12,
                paddingLeft: sidePadding,
                paddingRight: rightPadding,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                backgroundColor: colors.background,
            }}
        >
            <Svg name={colors.glyph} style={{ width: iconSize, height: iconSize, marginTop: 1, color: colors.icon }} />
            <View style={{ flex: 1, minWidth: 0, gap: large ? 4 : 2 }}>
                {title ? <Text style={titleStyle}>{title}</Text> : null}
                {body.map((line, index) => (
                    <Text key={index} style={bodyStyle}>
                        {line}
                    </Text>
                ))}
            </View>
            {onClose ? (
                <View style={{ marginTop: -6 }}>
                    <IconButton icon={MODERN_ICONS.close} label="Dismiss" size={28} iconSize={14} tone="muted" onPress={() => onClose()} />
                </View>
            ) : null}
        </View>
    );
}
