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
const PADDING_X = 13;
const CLOSE_SIZE = 20;
const CLOSE_INSET = 3;
const CLOSE_SHIFT = -9;
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
    const shift = useMotion(showClose ? CLOSE_SHIFT : 0);
    const [shiftBack] = useState(() => shift.interpolate({ inputRange: [CLOSE_SHIFT, 0], outputRange: [-CLOSE_SHIFT, 0] }));
    const closeOpacity = useMotion(showClose ? 1 : 0);
    const titleStyle = { fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 16 };
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
                style={{ height: HEIGHT, flexDirection: "row", alignItems: "center", paddingHorizontal: PADDING_X }}
                onMouseDown={handleDown}
                onMouseMove={handleMove}
                onMouseUp={handleUp}
            >
                <Animated.View style={{ flexDirection: "row", alignItems: "center", gap: layoutIcon ? 7 : 6, marginLeft: shift, marginRight: shiftBack }}>
                {layoutIcon ? <Svg name={layoutIcon} style={{ width: 15, height: 15, color: iconColor }} /> : null}
                {showLiveDot ? <LiveDot /> : null}
                <View style={{ maxWidth: TITLE_MAX_WIDTH, overflow: "hidden", justifyContent: "center" }}>
                    <Text numberOfLines={1} style={{ ...titleStyle, color: "transparent", fontWeight: "600" }}>
                        {title}
                    </Text>
                    <View style={{ ...FILL, justifyContent: "center" }}>
                        <Text testID={`tab-title-${id}`} numberOfLines={1} style={{ ...titleStyle, color: textColor, fontWeight: loud ? "600" : "500" }}>
                            {title}
                        </Text>
                    </View>
                </View>
                {showCount ? (
                    <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16, fontWeight: "500" }}>{String(splitCount)}</Text>
                ) : null}
                {showMentions ? <CountBadge testID={`tab-mentions-${id}`} count={mentions} /> : null}
                </Animated.View>
            </View>
            {closable ? (
                <Animated.View
                    pointerEvents={showClose ? "auto" : "none"}
                    style={{ position: "absolute", right: CLOSE_INSET, top: (HEIGHT - CLOSE_SIZE) / 2, opacity: closeOpacity }}
                >
                    <IconButton
                        testID={showClose ? `tab-close-${id}` : `tab-close-hidden-${id}`}
                        icon={MODERN_ICONS.close}
                        label="Close tab"
                        size={CLOSE_SIZE}
                        iconSize={13}
                        tone="muted"
                        onPress={props.onClose}
                    />
                </Animated.View>
            ) : null}
        </View>
    );
}
