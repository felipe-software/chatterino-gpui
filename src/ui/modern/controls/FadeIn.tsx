import { useEffect, useState, type ReactNode } from "react";
import { Animated, type ViewStyle } from "@felipe-software/react-native-gpui";
import { MOTION, MOTION_EASING } from "./motion";

type Props = { children?: ReactNode; style?: ViewStyle; offset?: number; duration?: number; testID?: string; pointerEvents?: "auto" | "none" | "box-none" };

export function FadeIn({ children, style, offset = 4, duration = MOTION.fast, testID, pointerEvents }: Props) {
    const [progress] = useState(() => new Animated.Value(0));
    useEffect(() => {
        const animation = Animated.timing(progress, { toValue: 1, duration, easing: MOTION_EASING });
        animation.start();
        return () => animation.stop();
    }, [progress, duration]);
    const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] });
    return (
        <Animated.View testID={testID} pointerEvents={pointerEvents} style={{ ...style, opacity: progress, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    );
}
