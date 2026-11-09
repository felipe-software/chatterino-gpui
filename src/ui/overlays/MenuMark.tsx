import type { ReactNode } from "react";
import { Svg, View } from "@felipe-software/react-native-gpui";
import { ICONS } from "../icons";
import { CONTROL_ICONS } from "../modern/controls/icons";
import type { ModernTokens } from "../modern/tokens";
import { useApp } from "../state/AppContext";
import type { MenuEntry } from "../state/overlays";
import { menuColors } from "../theme";

type Entry = Exclude<MenuEntry, { kind: "separator" }>;
type Placement = "leading" | "trailing";
type Props = { entry: Entry; placement?: Placement };

export const MODERN_MARK_SIZE = 16;

function modernBox(tokens: ModernTokens, checked: boolean): ReactNode {
    if (!checked) {
        return <View style={{ width: MODERN_MARK_SIZE, height: MODERN_MARK_SIZE, borderRadius: 4, borderWidth: 1.5, borderColor: tokens.lineHover }} />;
    }
    return (
        <View
            style={{
                width: MODERN_MARK_SIZE,
                height: MODERN_MARK_SIZE,
                borderRadius: 4,
                backgroundColor: tokens.accent,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Svg name={CONTROL_ICONS.checkBold} style={{ width: 11, height: 11, color: tokens.onAccent }} />
        </View>
    );
}

function modernMark(tokens: ModernTokens, entry: Entry, placement: Placement): ReactNode {
    if (entry.kind !== "item" || entry.checked === undefined) return null;
    if (entry.radio) {
        const showsCheck = placement === "trailing" && entry.checked;
        return showsCheck ? <Svg name={CONTROL_ICONS.checkMark} style={{ width: 15, height: 15, color: tokens.accent }} /> : null;
    }
    return placement === "leading" ? modernBox(tokens, entry.checked) : null;
}

export function MenuMark({ entry, placement = "leading" }: Props) {
    const { theme } = useApp();
    const colors = menuColors(theme);
    if (theme.modern) return <>{modernMark(theme.modern, entry, placement)}</>;
    if (placement !== "leading" || entry.kind !== "item" || entry.checked === undefined) return null;
    if (entry.radio) {
        return entry.checked ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.checkMark }} /> : null;
    }
    return (
        <View
            style={{
                width: 14,
                height: 14,
                borderWidth: 1,
                borderColor: colors.checkBorder,
                backgroundColor: colors.checkFill,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {entry.checked ? <Svg name={ICONS.check} style={{ width: 12, height: 12, color: colors.checkMark }} /> : null}
        </View>
    );
}
