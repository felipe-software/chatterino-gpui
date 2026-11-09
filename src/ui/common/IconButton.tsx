import { Image, View, type MouseResponderEvent } from "@felipe-software/react-native-gpui";
import { effectColor } from "../colors";
import { IconButton as ModernIconButton } from "../modern/controls/IconButton";
import { useApp } from "../state/AppContext";
import { HoverGlow } from "./HoverGlow";
import { useButtonEffect } from "./useButtonEffect";

type Props = {
    testID: string;
    label: string;
    icon: string;
    width: number;
    height: number;
    iconWidth: number;
    iconHeight: number;
    opacity?: number;
    onPress: (event: MouseResponderEvent) => void;
    onContextMenu?: (event: MouseResponderEvent) => void;
};

export function IconButton({ testID, label, icon, width, height, iconWidth, iconHeight, opacity, onPress, onContextMenu }: Props) {
    const { theme } = useApp();
    const effect = useButtonEffect();
    if (theme.modern) {
        return (
            <ModernIconButton
                testID={testID}
                label={label}
                icon={icon}
                width={width}
                height={height}
                iconSize={Math.max(iconWidth, iconHeight)}
                onPress={onPress}
                onContextMenu={onContextMenu}
            />
        );
    }
    return (
        <View
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={label}
            nativeListGroup={`icon-${testID}`}
            style={{ width, height, alignItems: "center", justifyContent: "center" }}
            onMouseEnter={effect.enter}
            onMouseMove={effect.move}
            onMouseLeave={effect.leave}
            onMouseDown={effect.press}
            onMouseUp={effect.release}
            onClick={onPress}
            onContextMenu={onContextMenu}
        >
            <Image source={{ uri: icon }} style={{ width: iconWidth, height: iconHeight, opacity: opacity ?? 1 }} resizeMode="contain" />
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
