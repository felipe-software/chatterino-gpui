import { useEffect, useState, type ReactNode } from "react";
import { Animated, type ViewStyle } from "@felipe-software/react-native-gpui";
import { MOTION, MOTION_EASING } from "./motion";

type Props = {
    children?: ReactNode;
    style?: ViewStyle;
    offset?: number;
    scaleFrom?: number;
    duration?: number;
    testID?: string;
    pointerEvents?: "auto" | "none" | "box-none";
};

export function FadeIn({ children, style, offset = 4, scaleFrom = 1, duration = MOTION.fast, testID, pointerEvents }: Props) {
    const [progress] = useState(() => new Animated.Value(0));
    useEffect(() => {
        const animation = Animated.timing(progress, { toValue: 1, duration, easing: MOTION_EASING });
        animation.start();
        return () => animation.stop();
    }, [progress, duration]);
    const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] });
    const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [scaleFrom, 1] });
    const transform = scaleFrom === 1 ? [{ translateY }] : [{ translateY }, { scale }];
    return (
        <Animated.View testID={testID} pointerEvents={pointerEvents} style={{ ...style, opacity: progress, transform }}>
            {children}
        </Animated.View>
    );
}
