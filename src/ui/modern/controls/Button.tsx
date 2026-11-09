import { Svg, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import type { ModernTokens } from "../tokens";
import { FadeLayer, layerFill } from "./FadeLayer";
import { useModernTokens } from "./useModernTokens";
import { usePressState } from "./usePressState";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonShape = "default" | "pill";

type Props = {
    label: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: string;
    iconPosition?: "start" | "end";
    shape?: ButtonShape;
    disabled?: boolean;
    grow?: boolean;
    testID?: string;
};

type Paint = { background: string; border: string; text: string; opacity: number };
type Interaction = "idle" | "hover" | "press" | "disabled";
type Metrics = { height: number; radius: number; fontSize: number; lineHeight: number; iconSize: number; gap: number; iconInset: number };

const METRICS: Record<ButtonSize, Metrics> = {
    sm: { height: 28, radius: 6, fontSize: 12, lineHeight: 16, iconSize: 14, gap: 6, iconInset: 8 },
    md: { height: 32, radius: 6, fontSize: 13, lineHeight: 16, iconSize: 16, gap: 6, iconInset: 10 },
    lg: { height: 40, radius: 8, fontSize: 14, lineHeight: 20, iconSize: 16, gap: 8, iconInset: 14 },
};

const PADDING: Record<ButtonSize, Record<ButtonVariant, number>> = {
    sm: { primary: 12, secondary: 9, ghost: 8, danger: 12 },
    md: { primary: 16, secondary: 14, ghost: 12, danger: 14 },
    lg: { primary: 20, secondary: 18, ghost: 14, danger: 18 },
};

const WEIGHT: Record<ButtonVariant, "500" | "600"> = { primary: "600", secondary: "500", ghost: "500", danger: "600" };

function paint(background: string, border: string, text: string, opacity = 1): Paint {
    return { background, border, text, opacity };
}

function primaryPaint(tokens: ModernTokens, state: Interaction): Paint {
    if (state === "disabled") return paint(tokens.bgInput, tokens.lineSubtle, tokens.text3);
    if (state === "press") return paint(tokens.accentPress, tokens.accentPress, tokens.onAccent);
    if (state === "hover") return paint(tokens.accentHover, tokens.accentHover, tokens.onAccent);
    return paint(tokens.accent, tokens.accent, tokens.onAccent);
}

function secondaryPaint(tokens: ModernTokens, state: Interaction): Paint {
    if (state === "disabled") return paint("transparent", tokens.lineSubtle, tokens.text3);
    if (state === "press") return paint(tokens.lineSubtle, tokens.lineHover, tokens.text);
    if (state === "hover") return paint(tokens.bgPress, tokens.lineStrong, tokens.text);
    return paint(tokens.bgInput, tokens.lineStrong, tokens.text);
}

function ghostPaint(tokens: ModernTokens, state: Interaction): Paint {
    if (state === "disabled") return paint("transparent", "transparent", tokens.text3, 0.6);
    if (state === "press") return paint(tokens.pressOv, "transparent", tokens.text);
    if (state === "hover") return paint(tokens.hoverOv, "transparent", tokens.text);
    return paint("transparent", "transparent", tokens.text2);
}

function dangerPaint(tokens: ModernTokens, state: Interaction): Paint {
    if (state === "disabled") return paint("transparent", tokens.lineSubtle, tokens.text3);
    if (state === "press") return paint(tokens.dangerTint, tokens.mention, tokens.mention);
    if (state === "hover") return paint(tokens.dangerTint, tokens.dangerLine, tokens.mention);
    return paint("transparent", tokens.dangerLine, tokens.mention);
}

export function buttonPaint(tokens: ModernTokens, variant: ButtonVariant, state: Interaction): Paint {
    switch (variant) {
        case "primary":
            return primaryPaint(tokens, state);
        case "ghost":
            return ghostPaint(tokens, state);
        case "danger":
            return dangerPaint(tokens, state);
        default:
            return secondaryPaint(tokens, state);
    }
}

function interactionOf(disabled: boolean, pressed: boolean, hovered: boolean): Interaction {
    if (disabled) return "disabled";
    if (pressed) return "press";
    if (hovered) return "hover";
    return "idle";
}

const PILL_PADDING = 14;
const PILL_ICON_INSET = 11;

export function Button({ label, onPress, variant = "secondary", size = "md", icon, iconPosition = "start", shape = "default", disabled = false, grow, testID }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const press = usePressState(disabled);
    const metrics = METRICS[size];
    const state = interactionOf(disabled, press.pressed, press.hovered);
    const base = buttonPaint(tokens, variant, disabled ? "disabled" : "idle");
    const hover = buttonPaint(tokens, variant, "hover");
    const pressed = buttonPaint(tokens, variant, "press");
    const textColor = buttonPaint(tokens, variant, state).text;
    const pill = shape === "pill";
    const borderWidth = variant === "ghost" || pill ? 0 : 1;
    const padding = pill ? PILL_PADDING : PADDING[size][variant];
    const iconInset = pill ? PILL_ICON_INSET : metrics.iconInset;
    const radius = pill ? metrics.height / 2 : metrics.radius;
    const iconAtStart = !!icon && iconPosition === "start";
    const iconAtEnd = !!icon && iconPosition === "end";
    const weight = size === "sm" ? "600" : WEIGHT[variant];
    const iconView = icon ? <Svg name={icon} style={{ width: metrics.iconSize, height: metrics.iconSize, color: textColor }} /> : null;
    const layer = { borderWidth, radius };
    return (
        <View
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled }}
            style={{
                height: metrics.height,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: metrics.gap,
                paddingLeft: (iconAtStart ? iconInset : padding) + borderWidth,
                paddingRight: (iconAtEnd ? iconInset : padding) + borderWidth,
                borderRadius: radius,
                boxShadow: pill ? tokens.shadow : undefined,
                opacity: base.opacity,
                flexGrow: grow ? 1 : 0,
                flexShrink: grow ? 1 : 0,
                cursor: disabled ? "default" : "pointer",
            }}
            {...press.handlers}
            onClick={disabled ? undefined : () => onPress()}
        >
            <View style={{ ...layerFill(radius), borderWidth, borderColor: base.border, backgroundColor: base.background }} />
            {disabled ? null : <FadeLayer visible={state === "hover"} color={hover.background} borderColor={hover.border} {...layer} />}
            {disabled ? null : <FadeLayer visible={state === "press"} color={pressed.background} borderColor={pressed.border} {...layer} />}
            {iconAtStart ? iconView : null}
            <Text
                numberOfLines={1}
                style={{
                    color: textColor,
                    fontFamily: fonts.uiFamily,
                    fontSize: metrics.fontSize,
                    lineHeight: metrics.lineHeight,
                    fontWeight: weight,
                }}
            >
                {label}
            </Text>
            {iconAtEnd ? iconView : null}
        </View>
    );
}
