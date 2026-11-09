import { Animated, Image, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import type { CompletionRow } from "../../splits/CompletionPopup";
import { HoverLayer } from "../controls/HoverLayer";
import { useModernTokens } from "../controls/useModernTokens";
import { useMotion } from "../controls/useMotion";
import { usePressState } from "../controls/usePressState";

type Props = { row: CompletionRow; selected: boolean; onPick: (row: CompletionRow) => void };

const HEIGHT = 32;
const RADIUS = 6;
const FILL = { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 } as const;

export function ModernCompletionRow({ row, selected, onPick }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const press = usePressState();
    const selectedOpacity = useMotion(selected ? 1 : 0);
    return (
        <View
            testID={`completion-${row.key}`}
            accessibilityRole="menuitem"
            accessibilityLabel={row.label}
            accessibilityState={{ selected }}
            style={{ height: HEIGHT, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, borderRadius: RADIUS, cursor: "pointer" }}
            {...press.handlers}
            onClick={() => onPick(row)}
        >
            <Animated.View pointerEvents="none" style={{ ...FILL, borderRadius: RADIUS, backgroundColor: tokens.accentSoft, opacity: selectedOpacity }} />
            <HoverLayer hovered={press.hovered && !selected} pressed={press.pressed} radius={RADIUS} color={tokens.bgHover} pressColor={tokens.bgPress} />
            {row.image ? <Image source={{ uri: row.image }} style={{ width: 24, height: 24 }} resizeMode="contain" /> : null}
            <Text numberOfLines={1} style={{ flex: 1, minWidth: 0, color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 16 }}>
                {row.name ?? row.label}
            </Text>
            {row.detail ? (
                <Text numberOfLines={1} style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>
                    {row.detail}
                </Text>
            ) : null}
        </View>
    );
}
