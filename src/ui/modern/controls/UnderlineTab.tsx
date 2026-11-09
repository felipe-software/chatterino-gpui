import { Animated, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import type { ModernTokens } from "../tokens";
import { useModernTokens } from "./useModernTokens";
import { useMotion } from "./useMotion";
import { usePressState } from "./usePressState";

type TabProps = {
    label: string;
    badge?: string;
    selected: boolean;
    height: number;
    testID?: string;
    onPress: () => void;
};

const UNDERLINE = { position: "absolute", left: 0, right: 0, bottom: 0, height: 2 } as const;

function labelColor(tokens: ModernTokens, selected: boolean, hovered: boolean): string {
    return selected || hovered ? tokens.text : tokens.text2;
}

export function UnderlineTab({ label, badge, selected, height, testID, onPress }: TabProps) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const press = usePressState(selected);
    const selection = useMotion(selected ? 1 : 0);
    const hover = useMotion(press.hovered && !selected ? 1 : 0);
    return (
        <View
            testID={testID}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            style={{
                height,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 2,
                paddingBottom: 2,
                cursor: selected ? "default" : "pointer",
            }}
            {...press.handlers}
            onClick={selected ? undefined : onPress}
        >
            <Animated.View pointerEvents="none" style={{ ...UNDERLINE, backgroundColor: tokens.lineStrong, opacity: hover }} />
            <Animated.View pointerEvents="none" style={{ ...UNDERLINE, backgroundColor: tokens.accent, opacity: selection }} />
            <Text
                numberOfLines={1}
                style={{
                    color: labelColor(tokens, selected, press.hovered),
                    fontFamily: fonts.uiFamily,
                    fontSize: 13,
                    lineHeight: 16,
                    fontWeight: selected ? "600" : "500",
                }}
            >
                {label}
            </Text>
            {badge ? (
                <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16, fontWeight: selected ? "500" : "400" }}>{badge}</Text>
            ) : null}
        </View>
    );
}
