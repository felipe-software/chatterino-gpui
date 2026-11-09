import { useMemo } from "react";
import type { ModernTokens } from "../tokens";
import { createMessageRecolor, recolorSignature, type MessageRecolor, type RecolorSettings } from "./messageColors";

export function useMessageRecolor(tokens: ModernTokens | undefined, settings: RecolorSettings): MessageRecolor | undefined {
    const signature = tokens ? recolorSignature(settings) : "";
    return useMemo(() => (tokens ? createMessageRecolor(tokens, settings) : undefined), [tokens, signature]);
}
