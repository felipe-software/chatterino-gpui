import { useRef, useState } from "react";
import { Animated, Svg, Text, View, type LayoutChangeEvent, type MouseResponderEvent } from "@felipe-software/react-native-gpui";
import { contains, type Rect } from "../../layout/geometry";
import { useApp } from "../../state/AppContext";
import type { TabState } from "../../theme";
import { CountBadge } from "../controls/CountBadge";
import { HoverLayer } from "../controls/HoverLayer";
import { IconButton } from "../controls/IconButton";
import { LiveDot } from "../controls/LiveDot";
import { useModernTokens } from "../controls/useModernTokens";
import { useMotion } from "../controls/useMotion";
import { MODERN_ICONS } from "../icons";

export type ModernTabModel = {
    id: string;
    title: string;
    state: TabState;
    live: boolean;
    splitCount: number;
    layoutIcon?: string;
    mentions: number;
};

type Props = ModernTabModel & {
    showLive: boolean;
    closable: boolean;
    onSelect: () => void;
    onClose: () => void;
    onRename: () => void;
    onMenu: (x: number, y: number) => void;
    onReorder: (x: number, y: number) => void;
    onLayout: (rect: Rect) => void;
};

const HEIGHT = 32;
const RADIUS = 6;
const FILL = { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 } as const;
const TITLE_MAX_WIDTH = 220;
const DOUBLE_CLICK_MS = 400;

export function ModernTab(props: Props) {
    const { id, title, state, live, showLive, closable, splitCount, layoutIcon, mentions } = props;
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const [hovered, setHovered] = useState(false);
    const pressed = useRef(false);
    const lastDown = useRef(0);
    const rect = useRef<Rect | null>(null);
    const selected = state === "selected";
    const loud = selected || state !== "regular";
    const textColor = loud || hovered ? tokens.text : tokens.text3;
    const iconColor = selected ? tokens.accent : textColor;
    const chipShadow = tokens.tabOnShadow !== "none" ? tokens.tabOnShadow : undefined;
    const chipOpacity = useMotion(selected ? 1 : 0);
    const showClose = closable && selected;
    const showCount = splitCount > 1;
    const showLiveDot = live && showLive && !layoutIcon;
    const showMentions = mentions > 0 && !selected;

    const handleDown = (event: MouseResponderEvent) => {
        if (event.nativeEvent.pressDrag) return;
        pressed.current = true;
        const now = Date.now();
        const isDoubleClick = now - lastDown.current < DOUBLE_CLICK_MS;
        lastDown.current = now;
        props.onSelect();
        if (isDoubleClick) props.onRename();
    };

    const handleMove = (event: MouseResponderEvent) => {
        const own = rect.current;
        if (!pressed.current || !own) return;
        const { pageX, pageY } = event.nativeEvent;
        if (!contains(own, pageX, pageY)) props.onReorder(pageX, pageY);
    };

    const handleUp = (event: MouseResponderEvent) => {
        if (event.nativeEvent.pressDrag) return;
        handleMove(event);
        pressed.current = false;
    };

    const handleLayout = (event: LayoutChangeEvent) => {
        rect.current = event.nativeEvent.layout;
        props.onLayout(event.nativeEvent.layout);
    };

    return (
        <View
            testID={`tab-${id}`}
            accessibilityLabel={title}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityHint={state}
            style={{ height: HEIGHT, flexDirection: "row", alignItems: "center", borderRadius: RADIUS }}
            onLayout={handleLayout}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onContextMenu={(event) => props.onMenu(event.nativeEvent.pageX, event.nativeEvent.pageY)}
        >
            <Animated.View
                pointerEvents="none"
                style={{ ...FILL, borderRadius: RADIUS, backgroundColor: tokens.tabOnBg, boxShadow: chipShadow, opacity: chipOpacity }}
            />
            <HoverLayer hovered={hovered && !selected} radius={RADIUS} color={tokens.tabHover} />
            <View
                nativeListGroup={`tab-${id}`}
                style={{
                    height: HEIGHT,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: layoutIcon ? 7 : 6,
                    paddingLeft: 10,
                    paddingRight: showClose ? 4 : 10,
                }}
                onMouseDown={handleDown}
                onMouseMove={handleMove}
                onMouseUp={handleUp}
            >
                {layoutIcon ? <Svg name={layoutIcon} style={{ width: 15, height: 15, color: iconColor }} /> : null}
                {showLiveDot ? <LiveDot /> : null}
                <View style={{ maxWidth: TITLE_MAX_WIDTH, overflow: "hidden" }}>
                    <Text numberOfLines={1} style={{ color: textColor, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 16, fontWeight: loud ? "600" : "500" }}>
                        {title}
                    </Text>
                </View>
                {showCount ? (
                    <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16, fontWeight: "500" }}>{String(splitCount)}</Text>
                ) : null}
                {showMentions ? <CountBadge testID={`tab-mentions-${id}`} count={mentions} /> : null}
            </View>
            {showClose ? (
                <View style={{ marginRight: 4 }}>
                    <IconButton testID={`tab-close-${id}`} icon={MODERN_ICONS.close} label="Close tab" size={24} iconSize={14} tone="muted" onPress={props.onClose} />
                </View>
            ) : null}
        </View>
    );
}
