import { useApp } from "../../state/AppContext";
import { modernTokens, type ModernTokens } from "../tokens";

const FALLBACK_DARK = modernTokens("dark", "sky");
const FALLBACK_LIGHT = modernTokens("light", "sky");

export function useModernTokens(): ModernTokens {
    const { theme } = useApp();
    if (theme.modern) return theme.modern;
    return theme.isLight ? FALLBACK_LIGHT : FALLBACK_DARK;
}
