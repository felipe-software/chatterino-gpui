import { View, type MouseResponderEvent } from "@felipe-software/react-native-gpui";
import { effectColor } from "../colors";
import { MODERN_ICONS } from "../modern/icons";
import { IconButton } from "../modern/controls/IconButton";
import { useApp } from "../state/AppContext";
import { HoverGlow } from "./HoverGlow";
import { useButtonEffect } from "./useButtonEffect";

type Props = {
    width: number;
    height: number;
    centerX: number;
    centerY: number;
    length: number;
    color: string;
    hoverColor: string;
    testID?: string;
    onPress: () => void;
    onMouseUp?: (event: MouseResponderEvent) => void;
};

export function PlusButton({ width, height, centerX, centerY, length, color, hoverColor, testID, onPress, onMouseUp }: Props) {
    const { theme } = useApp();
    const effect = useButtonEffect();
    const lineColor = effect.hovered ? hoverColor : color;
    const half = (length - 1) / 2;
    if (theme.modern) {
        return (
            <IconButton
                testID={testID}
                icon={MODERN_ICONS.plus}
                label="Add"
                width={width}
                height={height}
                iconSize={Math.min(18, Math.max(14, length + 4))}
                tone="muted"
                onPress={() => onPress()}
                onMouseUp={onMouseUp}
            />
        );
    }
    return (
        <View
            testID={testID}
            nativeListGroup={`plus-${testID ?? "button"}`}
            style={{ width, height }}
            onMouseEnter={effect.enter}
            onMouseMove={effect.move}
            onMouseLeave={effect.leave}
            onMouseDown={effect.press}
            onClick={onPress}
            onMouseUp={(event) => {
                effect.release();
                onMouseUp?.(event);
            }}
        >
            <View style={{ position: "absolute", left: centerX - half, top: centerY, width: length, height: 1, backgroundColor: lineColor }} />
            <View style={{ position: "absolute", left: centerX, top: centerY - half, width: 1, height: length, backgroundColor: lineColor }} />
            <HoverGlow
                width={width}
                height={height}
                color={effectColor(theme.isLight)}
                factor={effect.factor}
                pointer={effect.pointer}
                ripples={effect.ripples}
            />
        </View>
    );
}
