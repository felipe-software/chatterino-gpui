import { Animated } from "@felipe-software/react-native-gpui";
import { useMotion } from "./useMotion";

type Props = { x: number; width: number; height: number; color: string; shadow?: string };

export function SegmentIndicator({ x, width, height, color, shadow }: Props) {
    const left = useMotion(x);
    const size = useMotion(width);
    return (
        <Animated.View
            pointerEvents="none"
            style={{
                position: "absolute",
                left,
                top: 0,
                width: size,
                height,
                borderRadius: 6,
                backgroundColor: color,
                boxShadow: shadow,
            }}
        />
    );
}
