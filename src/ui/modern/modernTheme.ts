import type { AccentName, ThemeName } from "../../data/api";
import { withAlpha } from "../colors";
import type { TabStateColors, Theme } from "../theme";
import { modernTokens } from "./tokens";

function tab(background: string, line: string, text: string): TabStateColors {
    return { background, line, text };
}

export function modernTheme(name: ThemeName, accent: AccentName): Theme {
    const tokens = modernTokens(name, accent);
    const dropPreview = withAlpha(tokens.accent, 0.19);
    return {
        name,
        isLight: tokens.isLight,
        accent: tokens.accent,
        window: { background: tokens.bgWindow, text: tokens.text },
        tabs: {
            dividerLine: tokens.lineSubtle,
            live: tokens.live,
            rerun: tokens.warn,
            regular: tab(tokens.bgWindow, tokens.bgWindow, tokens.text3),
            newMessage: tab(tokens.bgWindow, tokens.bgWindow, tokens.text),
            highlighted: tab(tokens.bgWindow, tokens.mention, tokens.text),
            selected: tab(tokens.tabOnBg, tokens.accent, tokens.text),
        },
        messages: {
            background: tokens.bgChat,
            alternate: tokens.bgRaised,
            text: tokens.text,
            system: tokens.text3,
            link: tokens.accent,
            placeholder: tokens.text3,
            selection: withAlpha(tokens.accent, 0.28),
            separator: tokens.lineSubtle,
        },
        header: {
            background: tokens.bgRaised,
            border: tokens.lineSubtle,
            text: tokens.text,
            focusedBackground: tokens.bgRaised,
            focusedBorder: tokens.accent,
            focusedText: tokens.text,
        },
        input: { background: tokens.bgInput, text: tokens.text, border: tokens.lineStrong, selection: tokens.accentSoft },
        splits: {
            background: tokens.bgChat,
            borderFill: tokens.lineSubtle,
            dropPreview,
            dropPreviewBorder: tokens.accent,
            dropTargetBorder: tokens.accent,
            dropTargetCross: tokens.text,
            resizeHandle: withAlpha(tokens.accent, 0.44),
            resizeHandleBackground: withAlpha(tokens.accent, 0.13),
        },
        scrollbar: { thumb: tokens.thumb, thumbSelected: tokens.thumbHover },
        buttons: { plus: tokens.text3, kebab: tokens.text2, hover: tokens.text, icon: tokens.text2, iconHover: tokens.text },
        moreMessages: { background: tokens.accent, text: tokens.onAccent },
        modern: tokens,
    };
}
