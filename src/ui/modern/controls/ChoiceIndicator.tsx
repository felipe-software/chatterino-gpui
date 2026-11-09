import type { ReactNode } from "react";
import { View } from "@felipe-software/react-native-gpui";
import { FadeLayer, layerFill } from "./FadeLayer";
import { useModernTokens } from "./useModernTokens";

type Props = { on: boolean; hovered: boolean; round?: boolean; size?: number; mark: ReactNode };

const BORDER = 1.5;

export function ChoiceIndicator({ on, hovered, round = false, size = 18, mark }: Props) {
    const tokens = useModernTokens();
    const radius = round ? size / 2 : 5;
    const layer = { radius };
    return (
        <View style={{ width: size, height: size, borderRadius: radius }}>
            <View style={{ ...layerFill(radius), borderWidth: BORDER, borderColor: tokens.lineHover, backgroundColor: tokens.bgRaised }} />
            <FadeLayer visible={!on && hovered} color={tokens.bgHover} borderColor={tokens.text3} borderWidth={BORDER} {...layer} />
            <FadeLayer visible={on} color={tokens.accent} {...layer}>
                {mark}
            </FadeLayer>
            <FadeLayer visible={on && hovered} color={tokens.accentHover} {...layer}>
                {mark}
            </FadeLayer>
        </View>
    );
}
