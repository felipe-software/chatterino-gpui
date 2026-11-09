import type { ReactNode } from "react";
import { Svg, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import type { ModernTokens } from "../tokens";
import { FadeLayer, layerFill } from "./FadeLayer";
import { CONTROL_ICONS } from "./icons";
import { MONO_FONT } from "./typography";
import { useModernTokens } from "./useModernTokens";
import { usePressState } from "./usePressState";

type Props = {
    label: string;
    onPress?: () => void;
    selected?: boolean;
    monospace?: boolean;
    disabled?: boolean;
    size?: "md" | "lg";
    testID?: string;
};

function checkMark(tokens: ModernTokens, on: boolean, box: number, offBorder: string): ReactNode {
    const glyph = box > 16 ? 12 : 11;
    if (on) {
        return (
            <View style={{ width: box, height: box, borderRadius: 4, backgroundColor: tokens.accent, alignItems: "center", justifyContent: "center" }}>
                <Svg name={CONTROL_ICONS.checkBold} style={{ width: glyph, height: glyph, color: tokens.onAccent }} />
            </View>
        );
    }
    return <View style={{ width: box, height: box, borderRadius: 4, borderWidth: 1.5, borderColor: offBorder }} />;
}

type TogglePaint = { background: string; border: string; text: string };

function largePaint(tokens: ModernTokens, on: boolean, hovered: boolean): TogglePaint {
    const border = on ? tokens.lineStrong : tokens.lineSubtle;
    if (on) return { background: tokens.bgRaised, border: hovered ? tokens.lineHover : border, text: tokens.text };
    return { background: "transparent", border: hovered ? tokens.lineHover : border, text: tokens.text3 };
}

function mediumPaint(tokens: ModernTokens, hovered: boolean): TogglePaint {
    if (hovered) return { background: tokens.bgHover, border: tokens.lineHover, text: tokens.text };
    return { background: tokens.bgRaised, border: tokens.lineStrong, text: tokens.text };
}

export function Chip({ label, onPress, selected, monospace, disabled = false, size = "md", testID }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const press = usePressState(disabled || !onPress);
    const toggle = selected !== undefined;
    const fontFamily = monospace ? MONO_FONT : fonts.uiFamily;
    const interactive = !!onPress && !disabled;
    if (toggle) {
        const large = size === "lg";
        const paint = large ? largePaint(tokens, !!selected, press.hovered) : mediumPaint(tokens, press.hovered);
        const rest = large ? largePaint(tokens, !!selected, false) : mediumPaint(tokens, false);
        const hover = large ? largePaint(tokens, !!selected, true) : mediumPaint(tokens, true);
        const box = large ? 18 : 16;
        const offBorder = large ? tokens.lineHover : tokens.text3;
        return (
            <View
                testID={testID}
                accessibilityRole="checkbox"
                accessibilityLabel={label}
                accessibilityState={{ checked: selected, disabled }}
                style={{
                    height: large ? 40 : 34,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: large ? 10 : 8,
                    paddingHorizontal: 13,
                    borderRadius: 8,
                    opacity: disabled ? 0.7 : 1,
                    cursor: interactive ? "pointer" : "default",
                }}
                {...press.handlers}
                onClick={interactive ? () => onPress?.() : undefined}
            >
                <View style={{ ...layerFill(8), borderWidth: 1, borderColor: rest.border, backgroundColor: rest.background }} />
                <FadeLayer visible={press.hovered} color={hover.background} borderColor={hover.border} borderWidth={1} radius={8} />
                {checkMark(tokens, !!selected, box, offBorder)}
                <Text numberOfLines={1} style={{ color: disabled ? tokens.text3 : paint.text, fontFamily, fontSize: 13, lineHeight: 16, fontWeight: "500" }}>
                    {label}
                </Text>
            </View>
        );
    }
    return (
        <View
            testID={testID}
            accessibilityRole={onPress ? "button" : "text"}
            accessibilityLabel={label}
            style={{
                height: 24,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 9,
                borderRadius: 12,
                opacity: disabled ? 0.7 : 1,
                cursor: interactive ? "pointer" : "default",
            }}
            {...press.handlers}
            onClick={interactive ? () => onPress?.() : undefined}
        >
            <View style={{ ...layerFill(12), borderWidth: 1, borderColor: tokens.lineStrong }} />
            <FadeLayer visible={press.hovered} borderColor={tokens.lineHover} borderWidth={1} radius={12} />
            <Text numberOfLines={1} style={{ color: press.hovered ? tokens.text : tokens.text2, fontFamily, fontSize: 12, lineHeight: 16 }}>
                {label}
            </Text>
        </View>
    );
}
