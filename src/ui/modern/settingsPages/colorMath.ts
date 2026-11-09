import { parseColor, type Rgba } from "../../../data/util/colors";

export type Hsv = { h: number; s: number; v: number };

export function toHsv({ r, g, b }: Rgba): Hsv {
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    const delta = max - min;
    let h = 0;
    if (delta > 0) {
        if (max === r / 255) h = ((g - b) / 255 / delta) % 6;
        else if (max === g / 255) h = (b - r) / 255 / delta + 2;
        else h = (r - g) / 255 / delta + 4;
    }
    return { h: (h * 60 + 360) % 360, s: max === 0 ? 0 : delta / max, v: max };
}

export function fromHsv({ h, s, v }: Hsv, a: number): Rgba {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    const sector = Math.floor(h / 60) % 6;
    const table: Array<[number, number, number]> = [
        [c, x, 0],
        [x, c, 0],
        [0, c, x],
        [0, x, c],
        [x, 0, c],
        [c, 0, x],
    ];
    const [r, g, b] = table[sector];
    return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255), a };
}

export function argbHex(color: Rgba): string {
    const byte = (value: number) => value.toString(16).padStart(2, "0");
    return `#${byte(color.a)}${byte(color.r)}${byte(color.g)}${byte(color.b)}`;
}

export function parseArgbHex(text: string): Rgba | undefined {
    const match = /^#?([0-9a-f]{8}|[0-9a-f]{6})$/i.exec(text.trim());
    if (!match) return undefined;
    const raw = match[1];
    if (raw.length === 6) return parseColor(`#${raw}`);
    return parseColor(`#${raw.slice(2)}${raw.slice(0, 2)}`);
}
