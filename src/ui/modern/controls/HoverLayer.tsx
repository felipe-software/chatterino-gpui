import { Animated } from "@felipe-software/react-native-gpui";
import { useModernTokens } from "./useModernTokens";
import { useMotion } from "./useMotion";

type Props = { hovered: boolean; pressed?: boolean; radius?: number; color?: string; pressColor?: string };

const FILL = { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 } as const;

export function HoverLayer({ hovered, pressed = false, radius = 6, color, pressColor }: Props) {
    const tokens = useModernTokens();
    const hover = useMotion(hovered && !pressed ? 1 : 0);
    const press = useMotion(pressed ? 1 : 0);
    return (
        <>
            <Animated.View pointerEvents="none" style={{ ...FILL, borderRadius: radius, backgroundColor: color ?? tokens.hoverOv, opacity: hover }} />
            <Animated.View pointerEvents="none" style={{ ...FILL, borderRadius: radius, backgroundColor: pressColor ?? tokens.pressOv, opacity: press }} />
        </>
    );
}
