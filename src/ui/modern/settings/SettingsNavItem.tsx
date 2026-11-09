import { Animated, Svg, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { HoverLayer } from "../controls/HoverLayer";
import { useModernTokens } from "../controls/useModernTokens";
import { useMotion } from "../controls/useMotion";
import { usePressState } from "../controls/usePressState";
import type { ModernTokens } from "../tokens";
import { SETTINGS_NAV_ICONS } from "./icons";
import { modernPageLabel, type ModernPageName } from "./modernSettingsPages";

type Props = { page: ModernPageName; selected: boolean; onSelect: () => void };

const RADIUS = 6;
const FILL = { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 } as const;

function chipShadow(tokens: ModernTokens): string | undefined {
    return tokens.tabOnShadow === "none" ? undefined : tokens.tabOnShadow;
}

export function SettingsNavItem({ page, selected, onSelect }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const press = usePressState();
    const chip = useMotion(selected ? 1 : 0);
    const label = modernPageLabel(page);
    const emphasized = selected || press.hovered;
    return (
        <View
            testID={`settings-page-${page}`}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            style={{ height: 30, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, borderRadius: RADIUS, cursor: "pointer" }}
            {...press.handlers}
            onClick={onSelect}
        >
            <HoverLayer hovered={press.hovered && !selected} radius={RADIUS} color={tokens.tabHover} pressColor={tokens.tabHover} />
            <Animated.View
                pointerEvents="none"
                style={{ ...FILL, borderRadius: RADIUS, backgroundColor: tokens.tabOnBg, boxShadow: chipShadow(tokens), opacity: chip }}
            />
            <Svg name={SETTINGS_NAV_ICONS[page]} style={{ width: 18, height: 18, color: selected ? tokens.accent : tokens.text3 }} />
            <Text
                numberOfLines={1}
                style={{
                    flex: 1,
                    color: emphasized ? tokens.text : tokens.text2,
                    fontFamily: fonts.uiFamily,
                    fontSize: 13,
                    lineHeight: 16,
                    fontWeight: selected ? "600" : "500",
                }}
            >
                {label}
            </Text>
        </View>
    );
}
