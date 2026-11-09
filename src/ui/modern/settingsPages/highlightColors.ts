import { colorOr, DEFAULT_HIGHLIGHT_COLOR } from "../../../data/filters/highlights";
import { formatColor, opaque, parseColor } from "../../../data/util/colors";
import type { HighlightTone } from "../../settings/highlightRows";
import type { ModernTokens } from "../tokens";

export function toneColor(tokens: ModernTokens, tone: HighlightTone): string {
    switch (tone) {
        case "mention":
            return tokens.mention;
        case "first":
            return tokens.first;
        case "sub":
            return tokens.sub;
        case "warn":
            return tokens.warn;
        case "info":
            return tokens.accent;
    }
}

export function swatchColor(color: string | undefined): string | undefined {
    const parsed = parseColor(colorOr(color, DEFAULT_HIGHLIGHT_COLOR));
    return parsed ? formatColor(opaque(parsed)) : undefined;
}
