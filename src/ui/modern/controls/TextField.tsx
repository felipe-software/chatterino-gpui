import { forwardRef, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import { Svg, Text, TextInput, View, type TextInputHandle } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { inputRegistry } from "../../state/inputs";
import type { ModernTokens } from "../tokens";
import { FadeLayer, layerFill } from "./FadeLayer";
import { CONTROL_ICONS } from "./icons";
import { IconButton } from "./IconButton";
import { MONO_FONT } from "./typography";
import { useModernTokens } from "./useModernTokens";

export type TextFieldSize = "md" | "lg";
export type TextFieldAppearance = "field" | "search";

type Props = {
    value: string;
    onChange: (value: string) => void;
    testID: string;
    placeholder?: string;
    leadingIcon?: string;
    prefix?: string;
    clearable?: boolean;
    secure?: boolean;
    monospace?: boolean;
    autoFocus?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    size?: TextFieldSize;
    appearance?: TextFieldAppearance;
    height?: number;
    align?: "left" | "right";
    trailing?: ReactNode;
    width?: number;
    grow?: boolean;
    accessibilityLabel?: string;
    onSubmit?: () => void;
    onBlur?: () => void;
    onFocus?: () => void;
};

const HEIGHT: Record<TextFieldSize, number> = { md: 32, lg: 36 };
const FONT_SIZE = 13;
const LINE_HEIGHT = 18;
const BORDER = 1;

function fieldBackground(tokens: ModernTokens, size: TextFieldSize, appearance: TextFieldAppearance, disabled: boolean): string {
    if (disabled) return tokens.bgChat;
    if (appearance === "search") return tokens.bgRaised;
    return size === "md" ? tokens.bgInput : tokens.bgChat;
}

function endPadding(showClear: boolean, hasTrailing: boolean): number {
    if (showClear) return 4;
    if (hasTrailing) return 6;
    return 10;
}

function restBorder(tokens: ModernTokens, disabled: boolean, invalid: boolean, appearance: TextFieldAppearance): string {
    if (disabled) return tokens.lineSubtle;
    if (invalid) return tokens.mention;
    return appearance === "search" ? tokens.lineSubtle : tokens.lineStrong;
}

export const TextField = forwardRef<TextInputHandle, Props>(function TextField(
    {
        value,
        onChange,
        testID,
        placeholder,
        leadingIcon,
        prefix,
        clearable,
        secure,
        monospace,
        autoFocus,
        disabled = false,
        invalid = false,
        size = "lg",
        appearance = "field",
        height,
        align,
        trailing,
        width,
        grow,
        accessibilityLabel,
        onSubmit,
        onBlur,
        onFocus,
    },
    ref,
) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const input = useRef<TextInputHandle>(null);
    const [focused, setFocused] = useState(!!autoFocus);
    const [hovered, setHovered] = useState(false);
    useImperativeHandle(
        ref,
        () => ({
            focus: () => input.current?.focus(),
            clear: () => input.current?.clear(),
            blur: () => input.current?.blur(),
        }),
        [],
    );
    const composite = !!leadingIcon || !!prefix || !!clearable || appearance === "search";
    const boxHeight = height ?? HEIGHT[size];
    const showClear = !!clearable && value.length > 0 && !disabled;
    const hasTrailing = trailing !== undefined && trailing !== null;
    const borderColor = restBorder(tokens, disabled, invalid, appearance);
    const radius = composite ? 8 : 6;
    const interactive = !disabled && !invalid;
    const layer = { borderWidth: BORDER, radius };
    const textColor = disabled ? tokens.text3 : tokens.text;
    const fontFamily = monospace ? MONO_FONT : fonts.uiFamily;
    const registryKey = `field:${testID}`;
    return (
        <View
            style={{
                height: boxHeight,
                width,
                flexGrow: grow ? 1 : 0,
                flexShrink: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingLeft: 10 + BORDER,
                paddingRight: endPadding(showClear, hasTrailing) + BORDER,
                borderRadius: radius,
                cursor: disabled ? "default" : "text",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <View
                style={{
                    ...layerFill(radius),
                    borderWidth: BORDER,
                    borderColor,
                    backgroundColor: fieldBackground(tokens, size, appearance, disabled),
                }}
            />
            <FadeLayer visible={interactive && hovered && !focused} borderColor={tokens.lineHover} {...layer} />
            <FadeLayer visible={interactive && focused} borderColor={tokens.accent} {...layer} />
            {leadingIcon ? <Svg name={leadingIcon} style={{ width: 16, height: 16, color: tokens.text3 }} /> : null}
            <View style={{ flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", alignSelf: "stretch" }}>
                {prefix ? (
                    <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: FONT_SIZE, lineHeight: LINE_HEIGHT }}>{prefix}</Text>
                ) : null}
                <TextInput
                    ref={input}
                    testID={testID}
                    accessibilityLabel={accessibilityLabel ?? placeholder}
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor={tokens.text3}
                    secureTextEntry={secure}
                    autoFocus={autoFocus}
                    editable={!disabled}
                    onChangeText={onChange}
                    onSubmitEditing={() => onSubmit?.()}
                    onFocus={() => {
                        setFocused(true);
                        inputRegistry.setFocused(registryKey);
                        onFocus?.();
                    }}
                    onBlur={() => {
                        setFocused(false);
                        inputRegistry.blurred(registryKey);
                        onBlur?.();
                    }}
                    style={{
                        flex: 1,
                        alignSelf: "stretch",
                        color: textColor,
                        fontFamily,
                        fontSize: FONT_SIZE,
                        lineHeight: LINE_HEIGHT,
                        fontWeight: prefix ? "500" : "400",
                        textAlign: align,
                    }}
                />
            </View>
            {showClear ? (
                <IconButton
                    testID={`${testID}-clear`}
                    icon={CONTROL_ICONS.clear}
                    label="Clear"
                    size={28}
                    iconSize={14}
                    tone="muted"
                    onPress={() => {
                        onChange("");
                        input.current?.focus();
                    }}
                />
            ) : null}
            {hasTrailing ? trailing : null}
        </View>
    );
});
