import { Svg, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { TILE_GRID } from "../../overlays/emoteGridLayout";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_ICONS } from "../icons";

type Props = { title: string; count: number; open: boolean; top: number; width: number; sticky?: boolean; onToggle: () => void };

export function EmoteSectionHeader({ title, count, open, top, width, sticky = false, onToggle }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const text = { fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 };
    return (
        <View
            testID={sticky ? "emote-section-sticky" : `emote-section-${title}`}
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityState={{ expanded: open }}
            style={{
                position: "absolute",
                left: 0,
                top,
                width,
                height: TILE_GRID.headerLine,
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                paddingLeft: 6,
                paddingRight: 8,
                backgroundColor: tokens.bgChat,
                cursor: "pointer",
            }}
            onClick={onToggle}
        >
            <Svg name={open ? MODERN_ICONS.chevronDown : MODERN_ICONS.chevronRight} style={{ width: 10, height: 10, color: tokens.text3 }} />
            <Text numberOfLines={1} style={{ ...text, flexShrink: 1, color: tokens.text2, fontWeight: "600" }}>
                {title}
            </Text>
            <Text style={{ ...text, color: tokens.text3 }}>{String(count)}</Text>
            <View style={{ flex: 1, height: 1, marginLeft: 4, backgroundColor: tokens.lineSubtle }} />
        </View>
    );
}
