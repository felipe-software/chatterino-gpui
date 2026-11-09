import { useState } from "react";
import { NativeClipboard, Svg, View } from "@felipe-software/react-native-gpui";
import { ICONS } from "../icons";
import { MODERN_ICONS } from "../modern/icons";
import { IconButton } from "../modern/controls/IconButton";
import { useApp } from "../state/AppContext";

type Props = { text: string; label: string; testID: string; color: string };

export function CopyButton({ text, label, testID, color }: Props) {
    const { theme } = useApp();
    const [hovered, setHovered] = useState(false);
    if (theme.modern) {
        return <IconButton testID={testID} icon={MODERN_ICONS.copy} label={label} size={24} iconSize={14} tone="muted" onPress={() => NativeClipboard.setString(text)} />;
    }
    return (
        <View
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={{ width: 18, height: 18, alignItems: "center", justifyContent: "center", opacity: hovered ? 1 : 0.15 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => NativeClipboard.setString(text)}
        >
            <Svg name={ICONS.copy} style={{ width: 12, height: 12, color }} />
        </View>
    );
}
