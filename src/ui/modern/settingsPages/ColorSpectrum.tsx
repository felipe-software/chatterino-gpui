import { View } from "@felipe-software/react-native-gpui";
import { formatColor, type Rgba } from "../../../data/util/colors";
import { useModernTokens } from "../controls/useModernTokens";
import { fromHsv, type Hsv } from "./colorMath";

type Props = { color: Rgba; hsv: Hsv; size: number; onPick: (color: Rgba) => void };

const SB_CELLS = 12;
const HUE_CELLS = 24;
const ALPHA_CELLS = 16;
const STRIP = 12;

export function ColorSpectrum({ color, hsv, size, onPick }: Props) {
    const tokens = useModernTokens();
    const step = size / SB_CELLS;
    const cells: Array<{ key: string; s: number; v: number }> = [];
    for (let row = 0; row < SB_CELLS; row++) {
        for (let column = 0; column < SB_CELLS; column++) cells.push({ key: `${row}-${column}`, s: column / (SB_CELLS - 1), v: 1 - row / (SB_CELLS - 1) });
    }
    const frame = { width: size, borderRadius: 4, overflow: "hidden" as const, borderWidth: 1, borderColor: tokens.lineSubtle };
    return (
        <View style={{ gap: 8 }}>
            <View testID="color-spectrum" style={{ ...frame, height: size, borderRadius: 6, flexDirection: "row", flexWrap: "wrap" }}>
                {cells.map((cell) => (
                    <View
                        key={cell.key}
                        style={{ width: step, height: step, backgroundColor: formatColor(fromHsv({ h: hsv.h, s: cell.s, v: cell.v }, 255)) }}
                        onClick={() => onPick(fromHsv({ h: hsv.h, s: cell.s, v: cell.v }, color.a))}
                    />
                ))}
            </View>
            <View testID="color-hue" style={{ ...frame, height: STRIP, flexDirection: "row" }}>
                {Array.from({ length: HUE_CELLS }, (_, index) => {
                    const hue = (index * 360) / HUE_CELLS;
                    return (
                        <View
                            key={hue}
                            style={{ flex: 1, backgroundColor: formatColor(fromHsv({ h: hue, s: 1, v: 1 }, 255)) }}
                            onClick={() => onPick(fromHsv({ h: hue, s: Math.max(hsv.s, 0.05), v: Math.max(hsv.v, 0.05) }, color.a))}
                        />
                    );
                })}
            </View>
            <View testID="color-alpha" style={{ ...frame, height: STRIP, flexDirection: "row" }}>
                {Array.from({ length: ALPHA_CELLS }, (_, index) => {
                    const alpha = Math.round((index * 255) / (ALPHA_CELLS - 1));
                    return (
                        <View
                            key={alpha}
                            style={{ flex: 1, backgroundColor: formatColor({ ...color, a: alpha }) }}
                            onClick={() => onPick({ ...color, a: alpha })}
                        />
                    );
                })}
            </View>
        </View>
    );
}
