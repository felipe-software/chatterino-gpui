import { useEffect, useState } from "react";
import { Svg, Text, TextInput, View } from "@felipe-software/react-native-gpui";
import { ICONS } from "../icons";
import { TextField } from "../modern/controls/TextField";
import { useApp } from "../state/AppContext";
import { inputRegistry } from "../state/inputs";
import { chromeColors } from "../theme";
import { SETTINGS_CONTROL_HEIGHT, SETTINGS_FONT_SIZE, SETTINGS_STYLE } from "./settingsStyle";

const CHEVRON_UP = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M4 10L8 6L12 10" fill="none" stroke="black" stroke-width="1.5"/></svg>';

type Props = {
    testID: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    suffix?: string;
    width?: number;
    disabled?: boolean;
    onChange: (value: number) => void;
};

const MODERN_WIDTH = 72;

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

export function SpinBox({ testID, value, min, max, step = 1, suffix = "", width, disabled, onChange }: Props) {
    const { theme, fonts } = useApp();
    const colors = chromeColors(theme);
    const tokens = theme.modern;
    const fieldSuffix = tokens ? "" : suffix;
    const [text, setText] = useState(`${value}${fieldSuffix}`);
    const [focused, setFocused] = useState(false);
    useEffect(() => setText(`${value}${fieldSuffix}`), [value, fieldSuffix]);

    const parse = (raw: string) => Number.parseInt((fieldSuffix ? raw.replace(fieldSuffix, "") : raw).trim(), 10);
    const commit = () => {
        const parsed = parse(text);
        if (!Number.isFinite(parsed)) {
            setText(`${value}${fieldSuffix}`);
            return;
        }
        const next = clamp(parsed, min, max);
        setText(`${next}${fieldSuffix}`);
        if (next !== value) onChange(next);
    };
    const edit = (next: string) => {
        setText(next);
        const parsed = parse(next);
        if (Number.isFinite(parsed) && parsed >= min && parsed <= max && parsed !== value) onChange(parsed);
    };
    const nudge = (direction: number) => {
        if (disabled) return;
        const next = clamp(value + direction * step, min, max);
        if (next !== value) onChange(next);
    };

    if (tokens) {
        return (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <TextField testID={testID} size="md" align="right" value={text} width={width ?? MODERN_WIDTH} disabled={disabled} onChange={edit} onSubmit={commit} onBlur={commit} />
                {suffix ? <Text style={{ color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 }}>{suffix}</Text> : null}
            </View>
        );
    }

    const arrowColor = disabled ? SETTINGS_STYLE.disabledText : "#d0d0d0";
    return (
        <View
            style={{
                width: width ?? 90,
                height: SETTINGS_CONTROL_HEIGHT,
                flexDirection: "row",
                borderWidth: 1,
                borderRadius: 2,
                borderColor: focused ? colors.focusBorder : colors.fieldBorder,
                backgroundColor: colors.field,
            }}
        >
            <View style={{ flex: 1, paddingHorizontal: 4 }}>
                <TextInput
                    testID={testID}
                    value={text}
                    editable={!disabled}
                    onChangeText={edit}
                    onSubmitEditing={commit}
                    onFocus={() => {
                        setFocused(true);
                        inputRegistry.setFocused(`field:${testID}`);
                    }}
                    onBlur={() => {
                        setFocused(false);
                        inputRegistry.blurred(`field:${testID}`);
                        commit();
                    }}
                    style={{
                        marginTop: -5,
                        height: 32,
                        color: disabled ? SETTINGS_STYLE.disabledText : SETTINGS_STYLE.text,
                        fontFamily: fonts.appFamily,
                        fontSize: SETTINGS_FONT_SIZE,
                    }}
                />
            </View>
            <View style={{ width: 16, borderLeftWidth: 1, borderColor: colors.fieldBorder }}>
                <View
                    testID={`${testID}-up`}
                    accessibilityLabel="Increase"
                    style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                    onClick={() => nudge(1)}
                >
                    <Svg name={CHEVRON_UP} style={{ width: 10, height: 10, color: arrowColor }} />
                </View>
                <View
                    testID={`${testID}-down`}
                    accessibilityLabel="Decrease"
                    style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                    onClick={() => nudge(-1)}
                >
                    <Svg name={ICONS.chevronDown} style={{ width: 10, height: 10, color: arrowColor }} />
                </View>
            </View>
        </View>
    );
}
