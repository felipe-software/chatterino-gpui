import { useState } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import { formatColor, parseColor } from "../../data/util/colors";
import { useApp } from "../state/AppContext";
import { ColorPickerContent } from "./ColorPickerContent";
import { ColorSwatch } from "./ColorSwatch";
import { recentColors } from "./recentColors";
import { useSettingsUi } from "./SettingsContext";

type Props = { testID: string; color: string | undefined; width?: number; height?: number; onChange: (color: string) => void };

const MODERN_SWATCH = 20;

export function openColorPicker(ui: ReturnType<typeof useSettingsUi>, initial: string | undefined, recent: string[], onChange: (color: string) => void): void {
    ui.openPopup({
        kind: "modal",
        title: "Chatterino - Color picker",
        width: 430,
        height: 360,
        render: (close) => (
            <ColorPickerContent
                initial={initial}
                recent={recent}
                onAccept={(value) => {
                    onChange(value);
                    close();
                }}
                onCancel={close}
            />
        ),
    });
}

function colorLabel(color: string | undefined): string {
    const parsed = parseColor(color);
    return parsed ? formatColor(parsed).toUpperCase() : "None";
}

export function ColorButton({ testID, color, width = 20, height = 20, onChange }: Props) {
    const { settings, theme, fonts } = useApp();
    const ui = useSettingsUi();
    const [hovered, setHovered] = useState(false);
    const tokens = theme.modern;
    const open = () => openColorPicker(ui, color, recentColors(settings), onChange);

    if (tokens) {
        return (
            <View
                testID={testID}
                accessibilityRole="button"
                accessibilityLabel="Pick color"
                style={{
                    height: 32,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingLeft: 6,
                    paddingRight: 10,
                    backgroundColor: tokens.bgInput,
                    borderWidth: 1,
                    borderColor: hovered ? tokens.lineHover : tokens.lineStrong,
                    borderRadius: 6,
                    cursor: "pointer",
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={open}
            >
                <View style={{ width: MODERN_SWATCH, height: MODERN_SWATCH, borderRadius: 4, borderWidth: 1, borderColor: tokens.lineStrong, overflow: "hidden" }}>
                    <ColorSwatch color={color} width={MODERN_SWATCH - 2} height={MODERN_SWATCH - 2} cell={5} />
                </View>
                <Text style={{ color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 16 }}>{colorLabel(color)}</Text>
            </View>
        );
    }

    return (
        <View
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel="Pick color"
            style={{ borderWidth: 1, borderColor: "#000000", borderRadius: 2, overflow: "hidden" }}
            onClick={open}
        >
            <ColorSwatch color={color} width={width} height={height} cell={5} />
        </View>
    );
}
