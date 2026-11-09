import { useState } from "react";
import { Animated } from "@felipe-software/react-native-gpui";
import { useModernTokens } from "./useModernTokens";
import { useMotion } from "./useMotion";

type Props = { color?: string; size?: number; onPress?: () => void; testID?: string };

const EDGE = "rgba(255, 255, 255, 0.12)";
const HOVER_SCALE = 1.08;

export function Swatch({ color, size = 18, onPress, testID }: Props) {
    const tokens = useModernTokens();
    const [hovered, setHovered] = useState(false);
    const empty = !color;
    const scale = useMotion(hovered && onPress ? HOVER_SCALE : 1);
    return (
        <Animated.View
            testID={testID}
            accessibilityRole={onPress ? "button" : "image"}
            style={{
                width: size,
                height: size,
                borderRadius: 4,
                borderWidth: 1,
                borderStyle: empty ? "dashed" : "solid",
                borderColor: empty ? tokens.lineHover : EDGE,
                backgroundColor: color ?? "transparent",
                cursor: onPress ? "pointer" : "default",
                transform: [{ scale }],
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onPress ? () => onPress() : undefined}
        />
    );
}
