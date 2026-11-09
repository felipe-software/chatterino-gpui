import type { ChatListElement, ChatListMessage, ChatListMessagePatch } from "../../../native/chatList";
import { themePalette } from "../../../data";
import type { Settings } from "../../../data/api";
import {
    COLOR_AUTOMOD,
    COLOR_ELEVATED,
    COLOR_FIRST_MESSAGE,
    COLOR_REDEEMED,
    COLOR_SELF_HIGHLIGHT,
    COLOR_SELF_MESSAGE,
    COLOR_SUBSCRIPTION,
    COLOR_THREAD,
    COLOR_WATCH_STREAK,
    DEFAULT_HIGHLIGHT_COLOR,
    colorOr,
} from "../../../data/filters/highlights";
import { resolveTint } from "../../../data/messages/render";
import { blendColors, formatColor, opaque, parseColor } from "../../../data/util/colors";
import type { ModernTokens } from "../tokens";
import { readableNameColor } from "./readableColor";

export type HighlightKind = "mention" | "first" | "sub" | "warn" | "info";

export type MessageRecolor = {
    message(message: ChatListMessage): ChatListMessage;
    patch(patch: ChatListMessagePatch): ChatListMessagePatch;
};

export type RecolorSettings = Pick<
    Settings,
    | "theme"
    | "selfHighlightColor"
    | "whisperHighlightColor"
    | "threadHighlightColor"
    | "firstMessageHighlightColor"
    | "subHighlightColor"
    | "elevatedMessageHighlightColor"
    | "automodHighlightColor"
    | "redeemedHighlightColor"
    | "watchStreakHighlightColor"
    | "selfMessageHighlightColor"
    | "highlightPhrases"
    | "highlightUsers"
    | "highlightBadges"
>;

type Tint = { background: string; marker: string };

function kindSources(settings: RecolorSettings): Array<[string, HighlightKind]> {
    return [
        [colorOr(settings.selfHighlightColor, COLOR_SELF_HIGHLIGHT), "mention"],
        [colorOr(settings.whisperHighlightColor, COLOR_SELF_HIGHLIGHT), "mention"],
        [DEFAULT_HIGHLIGHT_COLOR, "mention"],
        [colorOr(settings.threadHighlightColor, COLOR_THREAD), "mention"],
        [colorOr(settings.firstMessageHighlightColor, COLOR_FIRST_MESSAGE), "first"],
        [colorOr(settings.subHighlightColor, COLOR_SUBSCRIPTION), "sub"],
        [colorOr(settings.elevatedMessageHighlightColor, COLOR_ELEVATED), "warn"],
        [colorOr(settings.automodHighlightColor, COLOR_AUTOMOD), "warn"],
        [colorOr(settings.redeemedHighlightColor, COLOR_REDEEMED), "info"],
        [colorOr(settings.watchStreakHighlightColor, COLOR_WATCH_STREAK), "info"],
        [colorOr(settings.selfMessageHighlightColor, COLOR_SELF_MESSAGE), "info"],
    ];
}

function customSources(settings: RecolorSettings): string[] {
    const entries = [...(settings.highlightPhrases ?? []), ...(settings.highlightUsers ?? []), ...(settings.highlightBadges ?? [])];
    return entries.map((entry) => colorOr(entry.color, DEFAULT_HIGHLIGHT_COLOR));
}

function kindTint(tokens: ModernTokens, kind: HighlightKind): Tint {
    switch (kind) {
        case "mention":
            return { background: tokens.mentionTint, marker: tokens.mention };
        case "first":
            return { background: tokens.firstTint, marker: tokens.first };
        case "sub":
            return { background: tokens.subTint, marker: tokens.sub };
        case "warn":
            return { background: tokens.warnTint, marker: tokens.warn };
        case "info":
            return { background: tokens.infoTint, marker: tokens.accent };
    }
}

function blendOnto(base: string, source: string): string | undefined {
    const under = parseColor(base);
    const over = parseColor(source);
    return under && over ? formatColor(blendColors(under, over)) : undefined;
}

function markerOf(source: string): string | undefined {
    const parsed = parseColor(source);
    return parsed ? formatColor(opaque(parsed)) : undefined;
}

type ColorMaps = { backgrounds: Map<string, string>; markers: Map<string, string> };

function colorMaps(tokens: ModernTokens, settings: RecolorSettings): ColorMaps {
    const chatterinoBackground = themePalette(settings.theme).background;
    const backgrounds = new Map<string, string>();
    const markers = new Map<string, string>();
    const remember = (source: string, tint: Tint) => {
        const background = blendOnto(chatterinoBackground, source);
        const marker = markerOf(source);
        if (background && !backgrounds.has(background)) backgrounds.set(background, tint.background);
        if (marker && !markers.has(marker)) markers.set(marker, tint.marker);
    };
    for (const [source, kind] of kindSources(settings)) remember(source, kindTint(tokens, kind));
    for (const source of customSources(settings)) {
        const background = blendOnto(tokens.bgChat, source);
        const marker = markerOf(source);
        if (background && marker) remember(source, { background, marker });
    }
    return { backgrounds, markers };
}

export function createMessageRecolor(tokens: ModernTokens, settings: RecolorSettings): MessageRecolor {
    const { backgrounds, markers } = colorMaps(tokens, settings);
    const systemColor = resolveTint("system", settings.theme);
    const linkColor = resolveTint("link", settings.theme);

    const recolorText = (color: string): string => {
        if (color === systemColor) return tokens.text3;
        if (color === linkColor) return tokens.accent;
        return readableNameColor(color, tokens.scheme);
    };

    const recolorElement = (element: ChatListElement): ChatListElement => {
        if (element.kind !== "text" && element.kind !== "user") return element;
        if (!element.color) return element;
        const color = recolorText(element.color);
        return color === element.color ? element : { ...element, color };
    };

    const recolorElements = (elements: ChatListElement[]): ChatListElement[] => elements.map(recolorElement);

    const recolorFields = (source: Partial<ChatListMessage>): Partial<ChatListMessage> => {
        const fields: Partial<ChatListMessage> = {};
        if (source.elements) fields.elements = recolorElements(source.elements);
        if (source.reply) fields.reply = recolorElements(source.reply);
        if (source.background) fields.background = backgrounds.get(source.background) ?? source.background;
        if (source.marker) fields.marker = markers.get(source.marker) ?? source.marker;
        return fields;
    };

    return {
        message: (message) => ({ ...message, ...recolorFields(message) }),
        patch: (patch) => ({ ...patch, ...recolorFields(patch) }),
    };
}

export function recolorSignature(settings: RecolorSettings): string {
    return JSON.stringify([
        settings.theme,
        settings.selfHighlightColor,
        settings.whisperHighlightColor,
        settings.threadHighlightColor,
        settings.firstMessageHighlightColor,
        settings.subHighlightColor,
        settings.elevatedMessageHighlightColor,
        settings.automodHighlightColor,
        settings.redeemedHighlightColor,
        settings.watchStreakHighlightColor,
        settings.selfMessageHighlightColor,
        customSources(settings),
    ]);
}
