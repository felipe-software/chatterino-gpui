import { Animated, Text, View } from "@felipe-software/react-native-gpui";
import type { AccentName } from "../../../data/api";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";
import { useMotion } from "../controls/useMotion";
import { usePressState } from "../controls/usePressState";
import type { ModernScheme } from "../tokens";
import { SystemThemeTilePreview } from "./SystemThemeTilePreview";
import { ThemeTilePreview } from "./ThemeTilePreview";

type Props = { value: string; label: string; selected: boolean; accent: AccentName; onSelect: () => void };

const SCHEMES: Record<string, ModernScheme> = { dark: "dark", black: "black", light: "light" };
const RADIUS = 12;
const RING = 2;
const INSET = 4;
const FILL = { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, borderRadius: RADIUS, borderWidth: RING } as const;

export function ThemeTile({ value, label, selected, accent, onSelect }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const press = usePressState();
    const hoverRing = useMotion(press.hovered && !selected ? 1 : 0);
    const selectedRing = useMotion(selected ? 1 : 0);
    const scheme = SCHEMES[value];
    return (
        <View
            testID={`settings-theme-${value}`}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ checked: selected }}
            style={{ flex: 1, minWidth: 0, gap: 8, padding: RING + INSET, borderRadius: RADIUS, cursor: "pointer" }}
            {...press.handlers}
            onClick={onSelect}
        >
            <View pointerEvents="none" style={{ ...FILL, borderColor: tokens.lineSubtle }} />
            <Animated.View pointerEvents="none" style={{ ...FILL, borderColor: tokens.lineHover, opacity: hoverRing }} />
            <Animated.View pointerEvents="none" style={{ ...FILL, borderColor: tokens.accent, opacity: selectedRing }} />
            {scheme ? <ThemeTilePreview scheme={scheme} accent={accent} /> : <SystemThemeTilePreview accent={accent} frame={tokens.lineSubtle} />}
            <Text
                numberOfLines={1}
                style={{
                    paddingHorizontal: 4,
                    paddingBottom: 2,
                    color: tokens.text,
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
