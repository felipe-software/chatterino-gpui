import { formatColor, parseColor } from "../../../data/util/colors";
import type { ModernScheme } from "../tokens";

type Oklch = { l: number; c: number; h: number };
type LinearRgb = { r: number; g: number; b: number };

const MIN_DARK_LIGHTNESS = 0.72;
const MAX_LIGHT_LIGHTNESS = 0.53;
const MAX_CHROMA = 0.16;
const GAMUT_STEPS = 24;
const GAMUT_EPSILON = 0.0001;

const cache = new Map<string, string>();

function toLinear(channel: number): number {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function toByte(linear: number): number {
    const clamped = Math.max(0, Math.min(1, linear));
    const encoded = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
    return Math.round(encoded * 255);
}

function toOklch(rgb: LinearRgb): Oklch {
    const l = Math.cbrt(0.4122214708 * rgb.r + 0.5363325363 * rgb.g + 0.0514459929 * rgb.b);
    const m = Math.cbrt(0.2119034982 * rgb.r + 0.6806995451 * rgb.g + 0.1073969566 * rgb.b);
    const s = Math.cbrt(0.0883024619 * rgb.r + 0.2817188376 * rgb.g + 0.6299787005 * rgb.b);
    const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const b = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return { l: lightness, c: Math.hypot(a, b), h: Math.atan2(b, a) };
}

function fromOklch(color: Oklch): LinearRgb {
    const a = color.c * Math.cos(color.h);
    const b = color.c * Math.sin(color.h);
    const l = (color.l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (color.l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (color.l - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return {
        r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    };
}

function inGamut(rgb: LinearRgb): boolean {
    const low = -GAMUT_EPSILON;
    const high = 1 + GAMUT_EPSILON;
    return rgb.r >= low && rgb.r <= high && rgb.g >= low && rgb.g <= high && rgb.b >= low && rgb.b <= high;
}

function fitChroma(color: Oklch): LinearRgb {
    const direct = fromOklch(color);
    if (inGamut(direct)) return direct;
    let low = 0;
    let high = color.c;
    for (let step = 0; step < GAMUT_STEPS; step++) {
        const middle = (low + high) / 2;
        if (inGamut(fromOklch({ ...color, c: middle }))) low = middle;
        else high = middle;
    }
    return fromOklch({ ...color, c: low });
}

function targetLightness(lightness: number, scheme: ModernScheme): number {
    if (scheme === "light") return Math.min(lightness, MAX_LIGHT_LIGHTNESS);
    return Math.max(lightness, MIN_DARK_LIGHTNESS);
}

function computeReadable(color: string, scheme: ModernScheme): string {
    const parsed = parseColor(color);
    if (!parsed) return color;
    const source = toOklch({ r: toLinear(parsed.r), g: toLinear(parsed.g), b: toLinear(parsed.b) });
    const lightness = targetLightness(source.l, scheme);
    const chroma = Math.min(source.c, MAX_CHROMA);
    const passes = lightness === source.l && chroma === source.c;
    if (passes) return color;
    const fitted = fitChroma({ l: lightness, c: chroma, h: source.h });
    return formatColor({ r: toByte(fitted.r), g: toByte(fitted.g), b: toByte(fitted.b), a: parsed.a });
}

export function readableNameColor(color: string, scheme: ModernScheme): string {
    const key = `${scheme}|${color}`;
    const known = cache.get(key);
    if (known !== undefined) return known;
    const readable = computeReadable(color, scheme);
    cache.set(key, readable);
    return readable;
}
