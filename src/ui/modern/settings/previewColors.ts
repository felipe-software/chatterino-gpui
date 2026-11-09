import type { ModernTokens } from "../tokens";

export type PreviewNames = { orbit: string; brisk: string; lumen: string };

const DARK_NAMES: PreviewNames = { orbit: "#76A2FE", brisk: "#9ECB4F", lumen: "#F9786D" };
const LIGHT_NAMES: PreviewNames = { orbit: "#264DAD", brisk: "#577900", lumen: "#AB302C" };

export function previewNames(tokens: ModernTokens): PreviewNames {
    return tokens.isLight ? LIGHT_NAMES : DARK_NAMES;
}
