import { useEffect, useState } from "react";
import { Animated, type AnimatedValue } from "@felipe-software/react-native-gpui";
import { MOTION, MOTION_EASING } from "./motion";

export function useMotion(target: number, duration: number = MOTION.fast): AnimatedValue {
    const [value] = useState(() => new Animated.Value(target));
    useEffect(() => {
        const animation = Animated.timing(value, { toValue: target, duration, easing: MOTION_EASING });
        animation.start();
        return () => animation.stop();
    }, [value, target, duration]);
    return value;
}
