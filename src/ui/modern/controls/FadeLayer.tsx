import type { ReactNode } from "react";
import { Animated } from "@felipe-software/react-native-gpui";
import { useMotion } from "./useMotion";

type Props = {
    visible: boolean;
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    radius?: number;
    outset?: number;
    duration?: number;
    children?: ReactNode;
};

export function layerFill(radius: number, outset = 0) {
    return { position: "absolute", left: -outset, top: -outset, right: -outset, bottom: -outset, borderRadius: radius } as const;
}

export function FadeLayer({ visible, color, borderColor, borderWidth, radius = 0, outset = 0, duration, children }: Props) {
    const opacity = useMotion(visible ? 1 : 0, duration);
    return (
        <Animated.View
            pointerEvents="none"
            style={{
                position: "absolute",
                left: -outset,
                top: -outset,
                right: -outset,
                bottom: -outset,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: radius,
                borderWidth,
                borderColor,
                backgroundColor: color,
                opacity,
            }}
        >
            {children}
        </Animated.View>
    );
}
