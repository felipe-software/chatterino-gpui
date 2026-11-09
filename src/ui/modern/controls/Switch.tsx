import { Animated, View } from "@felipe-software/react-native-gpui";
import { FadeLayer } from "./FadeLayer";
import { useModernTokens } from "./useModernTokens";
import { useMotion } from "./useMotion";
import { usePressState } from "./usePressState";

export type SwitchSize = "sm" | "md";

type Props = {
    value: boolean;
    onChange: (value: boolean) => void;
    label: string;
    disabled?: boolean;
    size?: SwitchSize;
    testID?: string;
};

type Metrics = { width: number; height: number; knob: number };

const METRICS: Record<SwitchSize, Metrics> = {
    sm: { width: 30, height: 18, knob: 14 },
    md: { width: 36, height: 20, knob: 16 },
};

const INSET = 2;

export function Switch({ value, onChange, label, disabled = false, size = "md", testID }: Props) {
    const tokens = useModernTokens();
    const press = usePressState(disabled);
    const metrics = METRICS[size];
    const progress = useMotion(value ? 1 : 0);
    const travel = metrics.width - metrics.knob - INSET * 2;
    const knobX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, travel] });
    const offOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
    const radius = metrics.height / 2;
    const knobRadius = metrics.knob / 2;
    const knobShadow = tokens.knobShadow === "none" ? undefined : tokens.knobShadow;
    const knobFill = { position: "absolute", left: 0, top: 0, width: metrics.knob, height: metrics.knob, borderRadius: knobRadius } as const;
    return (
        <View
            testID={testID}
            accessibilityRole="switch"
            accessibilityLabel={label}
            accessibilityState={{ checked: value, disabled }}
            style={{
                width: metrics.width,
                height: metrics.height,
                borderRadius: radius,
                backgroundColor: tokens.switchOff,
                opacity: disabled ? 0.45 : 1,
                cursor: disabled ? "default" : "pointer",
            }}
            {...press.handlers}
            onClick={disabled ? undefined : () => onChange(!value)}
        >
            <FadeLayer visible={!value && press.hovered} color={tokens.lineHover} radius={radius} />
            <FadeLayer visible={value} color={tokens.accent} radius={radius} />
            <FadeLayer visible={value && press.hovered} color={tokens.accentHover} radius={radius} />
            <Animated.View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    left: INSET,
                    top: INSET,
                    width: metrics.knob,
                    height: metrics.knob,
                    transform: [{ translateX: knobX }],
                }}
            >
                <Animated.View style={{ ...knobFill, backgroundColor: tokens.knobOff, boxShadow: knobShadow, opacity: offOpacity }} />
                <Animated.View style={{ ...knobFill, backgroundColor: tokens.onAccent, opacity: progress }} />
            </Animated.View>
        </View>
    );
}
