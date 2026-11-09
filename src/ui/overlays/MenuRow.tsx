import { useState } from "react";
import { Svg, Text, View } from "@felipe-software/react-native-gpui";
import { ICONS } from "../icons";
import { HoverLayer } from "../modern/controls/HoverLayer";
import { CONTROL_ICONS } from "../modern/controls/icons";
import { useApp } from "../state/AppContext";
import type { MenuEntry } from "../state/overlays";
import { menuColors } from "../theme";
import { MenuMark, MODERN_MARK_SIZE } from "./MenuMark";

type Props = {
    entry: Exclude<MenuEntry, { kind: "separator" }>;
    testID: string;
    highlighted: boolean;
    shortcutWidth: number;
    leading?: boolean;
    onHover: () => void;
    onPress: () => void;
};

export const MENU_ROW_HEIGHT = 24;
export const MODERN_MENU_ROW_HEIGHT = 32;

export function MenuRow({ entry, testID, highlighted, shortcutWidth, leading = false, onHover, onPress }: Props) {
    const { theme, fonts } = useApp();
    const colors = menuColors(theme);
    const tokens = theme.modern;
    const [hovered, setHovered] = useState(false);
    const disabled = entry.kind === "item" && !!entry.disabled;
    const active = (hovered || highlighted) && !disabled;
    const shortcut = entry.kind === "item" ? entry.shortcut : undefined;
    const enter = () => {
        setHovered(true);
        onHover();
    };
    const leave = () => setHovered(false);

    if (tokens) {
        const selected = entry.kind === "item" && !!entry.radio && !!entry.checked;
        const textColor = disabled ? tokens.text3 : tokens.text;
        return (
            <View
                testID={testID}
                accessibilityRole="menuitem"
                accessibilityLabel={entry.label}
                accessibilityState={{ disabled, selected }}
                style={{
                    height: MODERN_MENU_ROW_HEIGHT,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingHorizontal: 10,
                    borderRadius: 6,
                    backgroundColor: selected ? tokens.accentSoft : undefined,
                    cursor: disabled ? "default" : "pointer",
                }}
                onMouseEnter={enter}
                onMouseLeave={leave}
                onClick={disabled ? undefined : onPress}
            >
                {selected ? null : <HoverLayer hovered={active} color={tokens.bgHover} pressColor={tokens.bgHover} />}
                {leading ? (
                    <View style={{ width: MODERN_MARK_SIZE, alignItems: "center" }}>
                        <MenuMark entry={entry} />
                    </View>
                ) : null}
                <Text
                    numberOfLines={1}
                    style={{ flex: 1, color: textColor, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 16, fontWeight: selected ? "600" : "400" }}
                >
                    {entry.label}
                </Text>
                {shortcut ? (
                    <Text numberOfLines={1} style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>
                        {shortcut}
                    </Text>
                ) : null}
                {entry.kind === "submenu" ? <Svg name={CONTROL_ICONS.chevronRight} style={{ width: 14, height: 14, color: tokens.text3 }} /> : null}
                <MenuMark entry={entry} placement="trailing" />
            </View>
        );
    }

    const textColor = disabled ? colors.disabledText : colors.text;
    const text = { color: textColor, fontFamily: fonts.appFamily, fontSize: fonts.appSize };
    return (
        <View
            testID={testID}
            accessibilityRole="menuitem"
            accessibilityLabel={entry.label}
            accessibilityState={{ disabled }}
            style={{
                height: MENU_ROW_HEIGHT,
                flexDirection: "row",
                alignItems: "center",
                paddingRight: 8,
                backgroundColor: active ? colors.highlight : undefined,
                borderWidth: active ? 1 : 0,
                borderColor: colors.highlightOutline,
            }}
            onMouseEnter={enter}
            onMouseLeave={leave}
            onClick={disabled ? undefined : onPress}
        >
            <View style={{ width: 28, paddingLeft: 8, justifyContent: "center" }}>
                <MenuMark entry={entry} />
            </View>
            <Text numberOfLines={1} style={{ ...text, flex: 1 }}>
                {entry.label}
            </Text>
            {shortcutWidth > 0 ? (
                <Text numberOfLines={1} style={{ ...text, width: shortcutWidth }}>
                    {shortcut ?? ""}
                </Text>
            ) : null}
            {entry.kind === "submenu" ? <Svg name={ICONS.chevronRight} style={{ width: 10, height: 10, color: textColor }} /> : null}
        </View>
    );
}
