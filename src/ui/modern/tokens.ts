import type { AccentName, ThemeName } from "../../data/api";
import { mixOklab, oklchHex, translucent } from "./color";

export type ModernScheme = "dark" | "black" | "light";

export type ModernTokens = {
    scheme: ModernScheme;
    isLight: boolean;
    bgWindow: string;
    bgChat: string;
    bgRaised: string;
    bgHover: string;
    bgInput: string;
    bgPress: string;
    lineSubtle: string;
    lineStrong: string;
    lineHover: string;
    text: string;
    text2: string;
    text3: string;
    live: string;
    mention: string;
    mentionTint: string;
    first: string;
    firstTint: string;
    sub: string;
    subTint: string;
    warn: string;
    warnTint: string;
    warnLine: string;
    dangerLine: string;
    dangerTint: string;
    infoTint: string;
    success: string;
    slot: string;
    switchOff: string;
    knobOff: string;
    knobShadow: string;
    thumb: string;
    thumbHover: string;
    stripeA: string;
    stripeB: string;
    shadow: string;
    tooltipBg: string;
    tooltipFg: string;
    segOn: string;
    segShadow: string;
    hoverOv: string;
    pressOv: string;
    tabHover: string;
    tabOnBg: string;
    tabOnShadow: string;
    accent: string;
    accentHover: string;
    accentPress: string;
    accentSoft: string;
    onAccent: string;
};

type Tone = { base: string; hover: string; press: string };
type AccentPreset = { hue: number; dark: Tone; light: Tone };
type Lch = [number, number];

type Signals = { live: string; mention: string; first: string; sub: string; warn: string; success: string };

type SchemeRecipe = {
    isLight: boolean;
    window: Lch | string;
    chat: Lch | string;
    raised: Lch;
    hover: Lch;
    input: Lch;
    press: Lch;
    lineSubtle: Lch;
    lineStrong: Lch;
    lineHover: Lch;
    text: Lch;
    text2: Lch;
    text3: Lch;
    signals: Signals;
    tints: { mention: number; first: number; sub: number; warn: number; warnLine: number; dangerLine: number; accentSoft: number; info: number };
    overlays: { hover: number; press: number; tab: number };
    slot: string;
    shadow: string;
};

export const ACCENT_NAMES: readonly AccentName[] = ["sky", "teal", "indigo", "pink", "orange", "lime"];

const ACCENTS: Record<AccentName, AccentPreset> = {
    sky: { hue: 235, dark: { base: "#4EBDF7", hover: "#73CDFF", press: "#37AAE3" }, light: { base: "#0275A3", hover: "#06658E", press: "#045A7E" } },
    teal: { hue: 190, dark: { base: "#0DCBC3", hover: "#4CD9D2", press: "#08B6AF" }, light: { base: "#087C77", hover: "#046C68", press: "#00605C" } },
    indigo: { hue: 272, dark: { base: "#96ACFF", hover: "#ABBEFE", press: "#8298EF" }, light: { base: "#4F62C1", hover: "#4253B1", press: "#39489E" } },
    pink: { hue: 350, dark: { base: "#EE8DBD", hover: "#FBA0CC", press: "#DA7BAA" }, light: { base: "#A84078", hover: "#973069", press: "#87285D" } },
    orange: { hue: 55, dark: { base: "#F0995B", hover: "#FDAC73", press: "#DC8748" }, light: { base: "#964C04", hover: "#824103", press: "#723902" } },
    lime: { hue: 130, dark: { base: "#96C166", hover: "#A7D17C", press: "#83AE53" }, light: { base: "#497101", hover: "#3E6102", press: "#365501" } },
};

const DARK_SIGNALS: Signals = { live: "#F45058", mention: "#ED737B", first: "#4DC588", sub: "#B191EA", warn: "#E9B452", success: "#4DC588" };
const LIGHT_SIGNALS: Signals = { live: "#D73240", mention: "#C23C4C", first: "#0E8050", sub: "#7A53B4", warn: "#B17000", success: "#0E8050" };

const DARK: SchemeRecipe = {
    isLight: false,
    window: [0.15, 0.01],
    chat: [0.185, 0.012],
    raised: [0.215, 0.013],
    hover: [0.238, 0.014],
    input: [0.25, 0.014],
    press: [0.27, 0.015],
    lineSubtle: [0.29, 0.015],
    lineStrong: [0.33, 0.016],
    lineHover: [0.43, 0.018],
    text: [0.935, 0.006],
    text2: [0.76, 0.014],
    text3: [0.67, 0.016],
    signals: DARK_SIGNALS,
    tints: { mention: 0.16, first: 0.12, sub: 0.14, warn: 0.09, warnLine: 0.28, dangerLine: 0.32, accentSoft: 0.22, info: 0.1 },
    overlays: { hover: 0.09, press: 0.14, tab: 0.05 },
    slot: "rgba(255, 255, 255, 0.13)",
    shadow: "0px 10px 30px rgba(0, 0, 0, 0.5)",
};

const BLACK: SchemeRecipe = {
    ...DARK,
    window: "#000000",
    chat: "#000000",
    raised: [0.135, 0.008],
    hover: [0.165, 0.01],
    input: [0.205, 0.012],
    press: [0.235, 0.013],
    lineSubtle: [0.235, 0.013],
    lineStrong: [0.29, 0.015],
    tints: { ...DARK.tints, warn: 0.1, info: 0.12 },
    overlays: { hover: 0.1, press: 0.15, tab: 0.06 },
    slot: "rgba(255, 255, 255, 0.14)",
    shadow: "0px 10px 30px rgba(0, 0, 0, 0.7)",
};

const LIGHT: SchemeRecipe = {
    isLight: true,
    window: [0.948, 0.008],
    chat: [0.99, 0.003],
    raised: [0.999, 0.0015],
    hover: [0.957, 0.008],
    input: [0.968, 0.007],
    press: [0.93, 0.01],
    lineSubtle: [0.905, 0.009],
    lineStrong: [0.845, 0.011],
    lineHover: [0.76, 0.013],
    text: [0.23, 0.014],
    text2: [0.43, 0.016],
    text3: [0.505, 0.016],
    signals: LIGHT_SIGNALS,
    tints: { mention: 0.1, first: 0.1, sub: 0.1, warn: 0.09, warnLine: 0.32, dangerLine: 0.3, accentSoft: 0.14, info: 0.08 },
    overlays: { hover: 0.1, press: 0.16, tab: 0.07 },
    slot: "rgba(15, 20, 30, 0.12)",
    shadow: "0px 10px 30px rgba(20, 24, 32, 0.14)",
};

const RECIPES: Record<ModernScheme, SchemeRecipe> = { dark: DARK, black: BLACK, light: LIGHT };

export function modernScheme(theme: ThemeName): ModernScheme {
    if (theme === "black") return "black";
    if (theme === "dark") return "dark";
    return "light";
}

function surface(value: Lch | string, hue: number): string {
    if (typeof value === "string") return value;
    return oklchHex(value[0], value[1], hue);
}

function schemeExtras(scheme: ModernScheme, colors: { text: string; text2: string; chat: string; raised: string; hover: string; input: string; lineStrong: string; lineHover: string }, hue: number) {
    if (scheme === "light") {
        return {
            knobOff: "#FFFFFF",
            knobShadow: "0px 1px 2px rgba(15, 20, 30, 0.3)",
            thumb: oklchHex(0.8, 0.011, hue),
            thumbHover: oklchHex(0.72, 0.013, hue),
            stripeA: oklchHex(0.955, 0.007, hue),
            stripeB: oklchHex(0.935, 0.009, hue),
            tooltipFg: colors.chat,
            segOn: colors.raised,
            segShadow: `0px 0px 0px 1px ${colors.lineStrong}, 0px 1px 2px rgba(15, 20, 30, 0.12)`,
            tabOnBg: colors.raised,
            tabOnShadow: `0px 0px 0px 1px ${colors.lineStrong}, 0px 1px 3px rgba(15, 20, 30, 0.14)`,
            onAccent: "#FFFFFF",
        };
    }
    const blackScheme = scheme === "black";
    return {
        knobOff: colors.text2,
        knobShadow: "none",
        thumb: blackScheme ? colors.lineStrong : oklchHex(0.37, 0.016, hue),
        thumbHover: blackScheme ? colors.lineHover : oklchHex(0.44, 0.018, hue),
        stripeA: colors.hover,
        stripeB: blackScheme ? colors.raised : oklchHex(0.225, 0.013, hue),
        tooltipFg: blackScheme ? colors.raised : colors.chat,
        segOn: colors.lineStrong,
        segShadow: "none",
        tabOnBg: colors.input,
        tabOnShadow: "none",
        onAccent: "#090B0F",
    };
}

export function modernTokens(theme: ThemeName, accent: AccentName): ModernTokens {
    const scheme = modernScheme(theme);
    const recipe = RECIPES[scheme];
    const preset = ACCENTS[accent] ?? ACCENTS.sky;
    const hue = preset.hue;
    const tone = recipe.isLight ? preset.light : preset.dark;
    const signals = recipe.signals;
    const bgChat = surface(recipe.chat, hue);
    const bgRaised = surface(recipe.raised, hue);
    const bgHover = surface(recipe.hover, hue);
    const bgInput = surface(recipe.input, hue);
    const lineStrong = surface(recipe.lineStrong, hue);
    const lineHover = surface(recipe.lineHover, hue);
    const text = surface(recipe.text, hue);
    const text2 = surface(recipe.text2, hue);
    const mentionTint = mixOklab(signals.mention, recipe.tints.mention, bgChat);
    const softBase = recipe.isLight ? bgRaised : bgChat;
    const extras = schemeExtras(scheme, { text, text2, chat: bgChat, raised: bgRaised, hover: bgHover, input: bgInput, lineStrong, lineHover }, hue);
    return {
        scheme,
        isLight: recipe.isLight,
        bgWindow: surface(recipe.window, hue),
        bgChat,
        bgRaised,
        bgHover,
        bgInput,
        bgPress: surface(recipe.press, hue),
        lineSubtle: surface(recipe.lineSubtle, hue),
        lineStrong,
        lineHover,
        text,
        text2,
        text3: surface(recipe.text3, hue),
        live: signals.live,
        mention: signals.mention,
        mentionTint,
        first: signals.first,
        firstTint: mixOklab(signals.first, recipe.tints.first, bgChat),
        sub: signals.sub,
        subTint: mixOklab(signals.sub, recipe.tints.sub, bgChat),
        warn: signals.warn,
        warnTint: mixOklab(signals.warn, recipe.tints.warn, bgChat),
        warnLine: mixOklab(signals.warn, recipe.tints.warnLine, bgChat),
        dangerLine: mixOklab(signals.mention, recipe.tints.dangerLine, bgChat),
        dangerTint: mentionTint,
        infoTint: mixOklab(tone.base, recipe.tints.info, bgChat),
        success: signals.success,
        slot: recipe.slot,
        switchOff: lineStrong,
        knobOff: extras.knobOff,
        knobShadow: extras.knobShadow,
        thumb: extras.thumb,
        thumbHover: extras.thumbHover,
        stripeA: extras.stripeA,
        stripeB: extras.stripeB,
        shadow: recipe.shadow,
        tooltipBg: text,
        tooltipFg: extras.tooltipFg,
        segOn: extras.segOn,
        segShadow: extras.segShadow,
        hoverOv: translucent(text, recipe.overlays.hover),
        pressOv: translucent(text, recipe.overlays.press),
        tabHover: translucent(text, recipe.overlays.tab),
        tabOnBg: extras.tabOnBg,
        tabOnShadow: extras.tabOnShadow,
        accent: tone.base,
        accentHover: tone.hover,
        accentPress: tone.press,
        accentSoft: mixOklab(tone.base, recipe.tints.accentSoft, softBase),
        onAccent: extras.onAccent,
    };
}

export const MODERN_FONT = "Inter";
