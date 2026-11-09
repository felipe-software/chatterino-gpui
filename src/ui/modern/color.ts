export type Oklab = { l: number; a: number; b: number };

function toLinear(channel: number): number {
    return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function toGamma(channel: number): number {
    const clamped = Math.min(1, Math.max(0, channel));
    return clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
}

function hexByte(value: number): string {
    return Math.round(Math.min(1, Math.max(0, value)) * 255)
        .toString(16)
        .padStart(2, "0");
}

export function oklch(lightness: number, chroma: number, hue: number): Oklab {
    const radians = (hue * Math.PI) / 180;
    return { l: lightness, a: chroma * Math.cos(radians), b: chroma * Math.sin(radians) };
}

export function hexToOklab(hex: string): Oklab {
    const digits = hex.replace("#", "");
    const red = toLinear(parseInt(digits.slice(0, 2), 16) / 255);
    const green = toLinear(parseInt(digits.slice(2, 4), 16) / 255);
    const blue = toLinear(parseInt(digits.slice(4, 6), 16) / 255);
    const long = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
    const medium = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
    const short = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
    return {
        l: 0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short,
        a: 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short,
        b: 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short,
    };
}

export function oklabToHex(color: Oklab): string {
    const long = Math.pow(color.l + 0.3963377774 * color.a + 0.2158037573 * color.b, 3);
    const medium = Math.pow(color.l - 0.1055613458 * color.a - 0.0638541728 * color.b, 3);
    const short = Math.pow(color.l - 0.0894841775 * color.a - 1.291485548 * color.b, 3);
    const red = 4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short;
    const green = -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short;
    const blue = -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short;
    return `#${hexByte(toGamma(red))}${hexByte(toGamma(green))}${hexByte(toGamma(blue))}`.toUpperCase();
}

export function oklchHex(lightness: number, chroma: number, hue: number): string {
    return oklabToHex(oklch(lightness, chroma, hue));
}

export function mixOklab(first: string, firstShare: number, second: string): string {
    const one = hexToOklab(first);
    const two = hexToOklab(second);
    const rest = 1 - firstShare;
    return oklabToHex({
        l: one.l * firstShare + two.l * rest,
        a: one.a * firstShare + two.a * rest,
        b: one.b * firstShare + two.b * rest,
    });
}

export function translucent(hex: string, alpha: number): string {
    const digits = hex.replace("#", "");
    const red = parseInt(digits.slice(0, 2), 16);
    const green = parseInt(digits.slice(2, 4), 16);
    const blue = parseInt(digits.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
