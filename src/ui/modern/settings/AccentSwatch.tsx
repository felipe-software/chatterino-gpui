import { Animated, Svg, View } from "@felipe-software/react-native-gpui";
import type { AccentName } from "../../../data/api";
import { useModernTokens } from "../controls/useModernTokens";
import { useMotion } from "../controls/useMotion";
import { usePressState } from "../controls/usePressState";
import { MODERN_ICONS } from "../icons";
import { modernTokens } from "../tokens";

type Props = { accent: AccentName; label: string; selected: boolean; onSelect: () => void };

const SIZE = 28;
const RING_GAP = 4;
const RING_SIZE = SIZE + RING_GAP * 2;
const HOVER_SCALE = 1.08;
const SWATCH_EDGE = "rgba(0, 0, 0, 0.12)";

export function AccentSwatch({ accent, label, selected, onSelect }: Props) {
    const tokens = useModernTokens();
    const press = usePressState();
    const scale = useMotion(press.hovered ? HOVER_SCALE : 1);
    const swatch = modernTokens(tokens.scheme, accent);
    return (
        <View
            testID={`settings-accent-${accent}`}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ checked: selected }}
            style={{ width: SIZE, height: SIZE, cursor: "pointer" }}
            {...press.handlers}
            onClick={onSelect}
        >
            <Animated.View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: SIZE, height: SIZE, transform: [{ scale }] }}>
                {selected ? (
                    <View
                        style={{
                            position: "absolute",
                            left: -RING_GAP,
                            top: -RING_GAP,
                            width: RING_SIZE,
                            height: RING_SIZE,
                            borderRadius: RING_SIZE / 2,
                            borderWidth: 2,
                            borderColor: tokens.text,
                        }}
                    />
                ) : null}
                <View
                    style={{
                        width: SIZE,
                        height: SIZE,
                        borderRadius: SIZE / 2,
                        borderWidth: selected ? 0 : 1,
                        borderColor: SWATCH_EDGE,
                        backgroundColor: swatch.accent,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {selected ? <Svg name={MODERN_ICONS.check} style={{ width: 14, height: 14, color: swatch.onAccent }} /> : null}
                </View>
            </Animated.View>
        </View>
    );
}
