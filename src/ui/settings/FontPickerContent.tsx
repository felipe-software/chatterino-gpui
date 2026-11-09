import { useState } from "react";
import { ScrollView, Text, View } from "@felipe-software/react-native-gpui";
import { FONT_FAMILIES } from "../fonts";
import type { ModernTokens } from "../modern/tokens";
import { useApp } from "../state/AppContext";
import { SETTINGS_FONT_SIZE, SETTINGS_STYLE } from "./settingsStyle";
import { SLineEdit } from "./SLineEdit";
import { SPushButton } from "./SPushButton";

export type FontChoice = { family: string; size: number; weight: number };

type Props = { initial: FontChoice; onApply: (choice: FontChoice) => void; onClose: () => void };

const SIZES = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
const WEIGHTS: Array<[number, string]> = [
    [100, "Thin"],
    [200, "ExtraLight"],
    [300, "Light"],
    [400, "Normal"],
    [500, "Medium"],
    [600, "DemiBold"],
    [700, "Bold"],
    [800, "ExtraBold"],
    [900, "Black"],
];
const PREVIEW = "The quick brown fox jumps over the lazy dog";
const ROW = 22;

type Palette = { text: string; fontSize: number; border: string; list: string; selection: string; preview: string; previewText: string; radius: number };

const CLASSIC: Palette = {
    text: SETTINGS_STYLE.text,
    fontSize: SETTINGS_FONT_SIZE,
    border: SETTINGS_STYLE.tableBorder,
    list: SETTINGS_STYLE.tableBackground,
    selection: SETTINGS_STYLE.tableSelection,
    preview: "#191919",
    previewText: "#ffffff",
    radius: 0,
};

function modernPalette(tokens: ModernTokens): Palette {
    return {
        text: tokens.text,
        fontSize: 13,
        border: tokens.lineSubtle,
        list: tokens.bgChat,
        selection: tokens.accentSoft,
        preview: tokens.bgChat,
        previewText: tokens.text,
        radius: 6,
    };
}

export function FontPickerContent({ initial, onApply, onClose }: Props) {
    const { theme, fonts } = useApp();
    const [choice, setChoice] = useState(initial);
    const [search, setSearch] = useState("");
    const [sizeText, setSizeText] = useState(String(initial.size));
    const palette = theme.modern ? modernPalette(theme.modern) : CLASSIC;
    const families = FONT_FAMILIES.includes(initial.family) ? FONT_FAMILIES : [initial.family, ...FONT_FAMILIES];
    const shownFamilies = families.filter((family) => family.toLowerCase().includes(search.trim().toLowerCase()));
    const text = { color: palette.text, fontFamily: fonts.appFamily, fontSize: palette.fontSize };
    const listBox = { flex: 1, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.list, borderRadius: palette.radius || undefined };
    const row = (selected: boolean) => ({ height: ROW, justifyContent: "center" as const, paddingHorizontal: 4, backgroundColor: selected ? palette.selection : undefined });

    return (
        <View style={{ flex: 1, padding: 10, gap: 8 }}>
            <View style={{ flex: 1, flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 2, gap: 4 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={text}>Font</Text>
                        <SLineEdit testID="font-search" value={search} placeholder="Search..." grow onChange={setSearch} />
                    </View>
                    <ScrollView style={listBox}>
                        {shownFamilies.map((family) => (
                            <View key={family} testID={`font-family-${family}`} style={row(family === choice.family)} onClick={() => setChoice({ ...choice, family })}>
                                <Text style={text}>{family}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={text}>Size</Text>
                        <SLineEdit
                            testID="font-size"
                            value={sizeText}
                            grow
                            onChange={(value) => {
                                setSizeText(value);
                                const parsed = Number.parseInt(value, 10);
                                if (Number.isFinite(parsed) && parsed > 0 && parsed < 200) setChoice({ ...choice, size: parsed });
                            }}
                        />
                    </View>
                    <ScrollView style={listBox}>
                        {SIZES.map((size) => (
                            <View
                                key={size}
                                style={row(size === choice.size)}
                                onClick={() => {
                                    setSizeText(String(size));
                                    setChoice({ ...choice, size });
                                }}
                            >
                                <Text style={text}>{size}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                    <View style={{ height: 24, justifyContent: "center" }}>
                        <Text style={text}>Weight</Text>
                    </View>
                    <ScrollView style={listBox}>
                        {WEIGHTS.map(([weight, name]) => (
                            <View key={weight} style={row(weight === choice.weight)} onClick={() => setChoice({ ...choice, weight })}>
                                <Text style={text}>{name}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
            <Text style={text}>Preview</Text>
            <View
                style={{
                    height: 48,
                    justifyContent: "center",
                    paddingHorizontal: 6,
                    backgroundColor: palette.preview,
                    borderWidth: 1,
                    borderColor: palette.border,
                    borderRadius: palette.radius || undefined,
                }}
            >
                <Text style={{ color: palette.previewText, fontFamily: choice.family, fontSize: Math.round((choice.size * 96) / 72), fontWeight: String(choice.weight) as "400" }}>{PREVIEW}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 6 }}>
                <SPushButton testID="font-apply" label="Apply" onPress={() => onApply(choice)} />
                <SPushButton
                    testID="font-ok"
                    label="Ok"
                    primary
                    onPress={() => {
                        onApply(choice);
                        onClose();
                    }}
                />
                <SPushButton testID="font-cancel" label="Cancel" onPress={onClose} />
            </View>
        </View>
    );
}
