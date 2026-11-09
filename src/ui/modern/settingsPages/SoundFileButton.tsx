import { Animated } from "@felipe-software/react-native-gpui";
import { fileName } from "../../settings/highlightRows";
import { useSettingsTooltip } from "../../settings/useSettingsTooltip";
import { IconButton } from "../controls/IconButton";
import { useMotion } from "../controls/useMotion";
import { PAGE_ICONS } from "./pageIcons";

type Props = { testID: string; path: string | undefined; visible: boolean; onPress: () => void };

export function SoundFileButton({ testID, path, visible, onPress }: Props) {
    const name = fileName(path);
    const tooltip = name ? `Custom sound: ${name}` : "Choose a custom sound";
    const hover = useSettingsTooltip(tooltip);
    const shown = visible || !!name;
    const opacity = useMotion(shown ? 1 : 0);
    return (
        <Animated.View style={{ opacity }} {...hover}>
            <IconButton
                testID={testID}
                icon={PAGE_ICONS.sound}
                label={tooltip}
                size={24}
                iconSize={14}
                tone="muted"
                selected={!!name}
                onPress={() => onPress()}
            />
        </Animated.View>
    );
}
