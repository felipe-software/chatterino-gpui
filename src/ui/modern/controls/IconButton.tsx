import { Image, Svg, Text, View, type MouseResponderEvent } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import type { ModernTokens } from "../tokens";
import { HoverLayer } from "./HoverLayer";
import { isSvgMarkup } from "./icons";
import { useModernTokens } from "./useModernTokens";
import { usePressState } from "./usePressState";

export type IconButtonTone = "default" | "muted" | "danger";

type Props = {
    icon: string;
    label: string;
    onPress: (event: MouseResponderEvent) => void;
    size?: number;
    width?: number;
    height?: number;
    iconSize?: number;
    text?: string;
    tone?: IconButtonTone;
    selected?: boolean;
    disabled?: boolean;
    testID?: string;
    onContextMenu?: (event: MouseResponderEvent) => void;
    onMouseDown?: (event: MouseResponderEvent) => void;
    onMouseUp?: (event: MouseResponderEvent) => void;
};

function restColor(tokens: ModernTokens, tone: IconButtonTone): string {
    return tone === "default" ? tokens.text2 : tokens.text3;
}

function iconColorOf(tokens: ModernTokens, tone: IconButtonTone, active: boolean, disabled: boolean): string {
    if (disabled) return tokens.text3;
    if (!active) return restColor(tokens, tone);
    return tone === "danger" ? tokens.mention : tokens.text;
}

export function IconButton({
    icon,
    label,
    onPress,
    size = 32,
    width,
    height,
    iconSize = 18,
    text,
    tone = "default",
    selected = false,
    disabled = false,
    testID,
    onContextMenu,
    onMouseDown,
    onMouseUp,
}: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const press = usePressState(disabled);
    const labelled = text !== undefined;
    const boxWidth = labelled ? width : (width ?? size);
    const boxHeight = height ?? size;
    const radius = boxHeight <= 24 ? 5 : 6;
    const active = selected || press.hovered || press.pressed;
    const iconColor = iconColorOf(tokens, tone, active, disabled);
    const danger = tone === "danger";
    const hoverColor = danger ? tokens.dangerTint : tokens.hoverOv;
    const pressColor = danger ? tokens.dangerTint : tokens.pressOv;
    const iconStyle = { width: iconSize, height: iconSize };
    return (
        <View
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled, selected }}
            style={{
                width: boxWidth,
                height: boxHeight,
                flexDirection: "row",
                gap: 6,
                paddingHorizontal: labelled ? 8 : 0,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: radius,
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "default" : "pointer",
            }}
            onMouseEnter={press.handlers.onMouseEnter}
            onMouseLeave={press.handlers.onMouseLeave}
            onMouseDown={(event) => {
                press.handlers.onMouseDown(event);
                onMouseDown?.(event);
            }}
            onMouseUp={(event) => {
                press.handlers.onMouseUp();
                onMouseUp?.(event);
            }}
            onClick={disabled ? undefined : onPress}
            onContextMenu={onContextMenu}
        >
            {disabled ? null : (
                <HoverLayer hovered={press.hovered || selected} pressed={press.pressed} radius={radius} color={hoverColor} pressColor={pressColor} />
            )}
            {isSvgMarkup(icon) ? (
                <Svg name={icon} style={{ ...iconStyle, color: iconColor }} />
            ) : (
                <Image source={{ uri: icon }} style={iconStyle} resizeMode="contain" />
            )}
            {labelled ? (
                <Text numberOfLines={1} style={{ color: iconColor, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 16 }}>
                    {text}
                </Text>
            ) : null}
        </View>
    );
}
