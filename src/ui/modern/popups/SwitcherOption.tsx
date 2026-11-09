import { Svg, Text, View } from "@felipe-software/react-native-gpui";
import type { SwitcherItem } from "../../overlays/switcherItems";
import { useApp } from "../../state/AppContext";
import { FadeLayer } from "../controls/FadeLayer";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_ICONS } from "../icons";

type Props = { item: SwitcherItem; selected: boolean; onHover: () => void; onPress: () => void };

const RADIUS = 6;

function iconOf(item: SwitcherItem): string {
    if (item.kind === "newTab") return MODERN_ICONS.plus;
    if (item.kind === "newPopup") return MODERN_ICONS.externalLink;
    if (item.kind === "tab") return MODERN_ICONS.chat;
    return MODERN_ICONS.channel;
}

function textsOf(item: SwitcherItem): { title: string; detail?: string; strong: boolean } {
    if (item.kind === "split") return { title: item.channel, detail: item.tabTitle, strong: true };
    if (item.kind === "tab") return { title: item.tabTitle, detail: "Tab", strong: true };
    return { title: item.label, strong: false };
}

export function SwitcherOption({ item, selected, onHover, onPress }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const texts = textsOf(item);
    return (
        <View
            testID={`switcher-${item.key}`}
            accessibilityRole="menuitem"
            accessibilityState={{ selected }}
            style={{
                height: 36,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 10,
                borderRadius: RADIUS,
                cursor: "pointer",
            }}
            onMouseEnter={onHover}
            onClick={onPress}
        >
            <FadeLayer visible={selected} color={tokens.accentSoft} radius={RADIUS} />
            <Svg name={iconOf(item)} style={{ width: 16, height: 16, color: selected ? tokens.accent : tokens.text2 }} />
            <Text
                numberOfLines={1}
                style={{ flex: 1, color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18, fontWeight: texts.strong ? "600" : "400" }}
            >
                {texts.title}
            </Text>
            {texts.detail ? (
                <Text numberOfLines={1} style={{ maxWidth: 200, color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>
                    {texts.detail}
                </Text>
            ) : null}
        </View>
    );
}
