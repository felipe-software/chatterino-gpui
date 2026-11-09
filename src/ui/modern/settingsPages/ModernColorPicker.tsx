import { useState } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import { HIGHLIGHT_COLOR_PRESETS } from "../../../data/filters/highlights";
import { formatColor, parseColor, type Rgba } from "../../../data/util/colors";
import { useApp } from "../../state/AppContext";
import { Button } from "../controls/Button";
import { DialogFooter } from "../controls/DialogFooter";
import { Swatch } from "../controls/Swatch";
import { TextField } from "../controls/TextField";
import { useModernTokens } from "../controls/useModernTokens";
import { ChannelField } from "./ChannelField";
import { argbHex, parseArgbHex, toHsv } from "./colorMath";
import { ColorSpectrum } from "./ColorSpectrum";

type Props = { initial: string | undefined; recent: string[]; onAccept: (color: string) => void; onCancel: () => void };

const SPECTRUM = 140;
const RECENT_LIMIT = 8;
const CHANNELS = [
    { key: "r", label: "R" },
    { key: "g", label: "G" },
    { key: "b", label: "B" },
    { key: "a", label: "A" },
] as const;

export function ModernColorPicker({ initial, recent, onAccept, onCancel }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const [color, setColor] = useState<Rgba>(() => parseColor(initial) ?? { r: 127, g: 63, b: 73, a: 127 });
    const [hex, setHex] = useState(() => argbHex(color));
    const hsv = toHsv(color);
    const label = { color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16, fontWeight: "500" as const };

    const apply = (next: Rgba) => {
        setColor(next);
        setHex(argbHex(next));
    };
    const pick = (value: string) => {
        const parsed = parseColor(value);
        if (parsed) apply(parsed);
    };
    const swatches = (colors: string[], prefix: string) => (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {colors.map((value, index) => (
                <Swatch key={`${value}-${index}`} testID={`${prefix}-${index}`} color={value} size={20} onPress={() => pick(value)} />
            ))}
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1, flexDirection: "row", gap: 20, paddingTop: 8, paddingHorizontal: 20, paddingBottom: 16 }}>
                <View style={{ gap: 12 }}>
                    <ColorSpectrum color={color} hsv={hsv} size={SPECTRUM} onPick={apply} />
                    <View
                        testID="color-preview"
                        style={{
                            width: SPECTRUM,
                            height: 24,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: tokens.lineStrong,
                            backgroundColor: formatColor(color),
                        }}
                    />
                </View>
                <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, gap: 12 }}>
                    {recent.length > 0 ? (
                        <View style={{ gap: 6 }}>
                            <Text style={label}>Recently used</Text>
                            {swatches(recent.slice(0, RECENT_LIMIT), "color-recent")}
                        </View>
                    ) : null}
                    <View style={{ gap: 6 }}>
                        <Text style={label}>Presets</Text>
                        {swatches(HIGHLIGHT_COLOR_PRESETS, "color-preset")}
                    </View>
                    <TextField
                        testID="color-hex"
                        size="md"
                        monospace
                        accessibilityLabel="Hex"
                        value={hex}
                        onChange={(text) => {
                            setHex(text);
                            const parsed = parseArgbHex(text);
                            if (parsed) setColor(parsed);
                        }}
                    />
                    <View style={{ flexDirection: "row", gap: 6 }}>
                        {CHANNELS.map((channel) => (
                            <ChannelField
                                key={channel.key}
                                testID={`color-${channel.key}`}
                                label={channel.label}
                                value={color[channel.key]}
                                onChange={(value) => apply({ ...color, [channel.key]: value })}
                            />
                        ))}
                    </View>
                </View>
            </View>
            <DialogFooter>
                <Button testID="color-cancel" label="Cancel" onPress={onCancel} />
                <Button testID="color-ok" label="OK" variant="primary" onPress={() => onAccept(formatColor(color))} />
            </DialogFooter>
        </View>
    );
}
