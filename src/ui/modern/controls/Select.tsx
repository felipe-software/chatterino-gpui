import { useRef, useState } from "react";
import { Svg, Text, View, type LayoutChangeEvent, type MouseResponderEvent } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import type { MenuEntry } from "../../state/overlays";
import type { ModernTokens } from "../tokens";
import { FadeLayer, layerFill } from "./FadeLayer";
import { CONTROL_ICONS } from "./icons";
import { useMenuHost } from "./MenuHost";
import { useModernTokens } from "./useModernTokens";
import { usePressState } from "./usePressState";

export type SelectOption<T extends string | number> = { value: T; label: string };

export type SelectAnchor = { x: number; y: number; width: number; height: number };

type Props<T extends string | number> = {
    value: T;
    options: Array<SelectOption<T>>;
    onChange: (value: T) => void;
    testID: string;
    width?: number;
    grow?: boolean;
    disabled?: boolean;
    placeholder?: string;
    open?: boolean;
    onOpen?: (anchor: SelectAnchor, entries: MenuEntry[]) => void;
};

const HEIGHT = 32;
const DEFAULT_WIDTH = 160;
const MENU_GAP = 4;

type Paint = { background: string; border: string; chevron: string };

function selectPaint(tokens: ModernTokens, state: { disabled: boolean; open: boolean; hovered: boolean }): Paint {
    if (state.disabled) return { background: tokens.bgChat, border: tokens.lineSubtle, chevron: tokens.text3 };
    if (state.open) return { background: tokens.bgInput, border: tokens.accent, chevron: tokens.accent };
    if (state.hovered) return { background: tokens.bgPress, border: tokens.lineHover, chevron: tokens.text2 };
    return { background: tokens.bgInput, border: tokens.lineStrong, chevron: tokens.text3 };
}

export function Select<T extends string | number>({ value, options, onChange, testID, width, grow, disabled = false, placeholder, open, onOpen }: Props<T>) {
    const { fonts, overlays, openOverlay } = useApp();
    const host = useMenuHost();
    const tokens = useModernTokens();
    const press = usePressState(disabled);
    const [menuId, setMenuId] = useState<string | null>(null);
    const boxWidth = width ?? (grow ? undefined : DEFAULT_WIDTH);
    const size = useRef({ width: boxWidth ?? 0, height: HEIGHT });
    const current = options.find((option) => option.value === value);
    const hostOpen = !!host && host.openId === menuId;
    const overlayOpen = overlays.some((overlay) => overlay.id === menuId);
    const menuOpen = menuId !== null && (hostOpen || overlayOpen);
    const isOpen = open ?? menuOpen;
    const colors = selectPaint(tokens, { disabled, open: isOpen, hovered: press.hovered });
    const rest = selectPaint(tokens, { disabled, open: false, hovered: false });
    const layer = { borderWidth: 1, radius: 6 };
    const label = current?.label ?? placeholder ?? String(value);
    const labelColor = current || !placeholder ? tokens.text : tokens.text3;

    const entries = (): MenuEntry[] =>
        options.map((option) => ({
            kind: "item",
            label: option.label,
            checked: option.value === value,
            radio: true,
            onSelect: () => onChange(option.value),
        }));

    const show = (event: MouseResponderEvent) => {
        const left = event.nativeEvent.pageX - event.nativeEvent.locationX;
        const top = event.nativeEvent.pageY - event.nativeEvent.locationY;
        const anchor = { x: left, y: top, width: size.current.width, height: size.current.height };
        if (onOpen) {
            onOpen(anchor, entries());
            return;
        }
        const request = { x: left + anchor.width, y: top + anchor.height + MENU_GAP, alignRight: true, minWidth: anchor.width, entries: entries() };
        const id = host ? host.open(request) : openOverlay({ kind: "menu", ...request });
        setMenuId(id);
    };

    return (
        <View
            testID={testID}
            accessibilityRole="combobox"
            accessibilityLabel={label}
            accessibilityState={{ disabled, expanded: isOpen }}
            style={{
                width: boxWidth,
                height: HEIGHT,
                flexGrow: grow ? 1 : 0,
                flexShrink: grow ? 1 : 0,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingLeft: 11,
                paddingRight: 9,
                borderRadius: 6,
                cursor: disabled ? "default" : "pointer",
            }}
            onLayout={(event: LayoutChangeEvent) => {
                size.current = { width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height };
            }}
            {...press.handlers}
            onClick={disabled ? undefined : show}
        >
            <View style={{ ...layerFill(6), borderWidth: 1, borderColor: rest.border, backgroundColor: rest.background }} />
            {disabled ? null : <FadeLayer visible={press.hovered && !isOpen} color={tokens.bgPress} borderColor={tokens.lineHover} {...layer} />}
            {disabled ? null : <FadeLayer visible={isOpen} borderColor={tokens.accent} {...layer} />}
            <Text
                numberOfLines={1}
                style={{
                    flex: 1,
                    color: disabled ? tokens.text3 : labelColor,
                    fontFamily: fonts.uiFamily,
                    fontSize: 13,
                    lineHeight: 16,
                }}
            >
                {label}
            </Text>
            <Svg name={isOpen ? CONTROL_ICONS.chevronUp : CONTROL_ICONS.chevronDown} style={{ width: 16, height: 16, color: colors.chevron }} />
        </View>
    );
}
