import { useState } from "react";
import { Animated, Text, View } from "@felipe-software/react-native-gpui";
import { hotkeyKeyParts, hotkeyTitle, type HotkeyEntry } from "../../settings/hotkeyCatalog";
import { useSettingsTooltip } from "../../settings/useSettingsTooltip";
import { useApp } from "../../state/AppContext";
import { HoverLayer } from "../controls/HoverLayer";
import { IconButton } from "../controls/IconButton";
import { Kbd } from "../controls/Kbd";
import { useModernTokens } from "../controls/useModernTokens";
import { useMotion } from "../controls/useMotion";
import { PAGE_ICONS } from "./pageIcons";

type Props = {
    testID: string;
    entry: HotkeyEntry;
    working: boolean;
    first: boolean;
    tooltip?: string;
    onEdit: () => void;
};

export function HotkeyRow({ testID, entry, working, first, tooltip, onEdit }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const [hovered, setHovered] = useState(false);
    const editOpacity = useMotion(hovered ? 1 : 0);
    const hover = useSettingsTooltip(tooltip);
    const title = hotkeyTitle(entry.name);
    const keys = hotkeyKeyParts(entry.key);
    return (
        <View
            testID={testID}
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                minHeight: first ? 46 : 47,
                paddingLeft: 16,
                paddingRight: 8,
                borderTopWidth: first ? 0 : 1,
                borderTopColor: tokens.lineSubtle,
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <HoverLayer hovered={hovered} radius={0} color={tokens.bgHover} />
            <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }} {...hover}>
                <Text
                    numberOfLines={1}
                    style={{ color: working ? tokens.text : tokens.text3, fontFamily: fonts.uiFamily, fontSize: 14, lineHeight: 20, fontWeight: "500" }}
                >
                    {title}
                </Text>
            </View>
            <View
                testID={`${testID}-keys`}
                accessibilityRole="button"
                accessibilityLabel={`Change shortcut for ${title}`}
                style={{ flexDirection: "row", alignItems: "center", gap: 4, cursor: "pointer" }}
                onClick={onEdit}
            >
                {keys.map((key, index) => (
                    <Kbd key={`${key}-${index}`} label={key} />
                ))}
            </View>
            <Animated.View style={{ width: 30, opacity: editOpacity }}>
                <IconButton
                    testID={`${testID}-edit`}
                    icon={PAGE_ICONS.pencil}
                    iconSize={15}
                    size={30}
                    tone="muted"
                    label={`Change shortcut for ${title}`}
                    onPress={onEdit}
                />
            </Animated.View>
        </View>
    );
}
