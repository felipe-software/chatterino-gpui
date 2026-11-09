import { useEffect, useRef, useState } from "react";
import { View } from "@felipe-software/react-native-gpui";
import type { SplitLeaf } from "../../data/api";
import { withAlpha } from "../colors";
import type { Rect } from "../layout/geometry";
import { MODERN_COMPACT_HEADER_HEIGHT, MODERN_HEADER_HEIGHT } from "../modern/splits/ModernSplitHeader";
import { ModernSplitOverlay } from "../modern/splits/ModernSplitOverlay";
import type { ModernTokens } from "../modern/tokens";
import { useApp } from "../state/AppContext";
import { inputRegistry } from "../state/inputs";
import { useChannel, useChannelInfo } from "../state/useChannel";
import { useSplitChannel } from "../state/useSplitChannel";
import { useStore } from "../state/useStore";
import { ChatView, type ChatViewHandle } from "./ChatView";
import { SplitHeader } from "./SplitHeader";
import { SplitInput, type SplitInputHandle } from "./SplitInput";
import { SplitOverlay } from "./SplitOverlay";

type Props = {
    split: SplitLeaf;
    tabId: string;
    rect: Rect;
    pageOrigin: { x: number; y: number };
    focused: boolean;
    isTopRight: boolean;
    framed?: boolean;
    ghost: boolean;
    overlay: boolean;
    zoomWheel: boolean;
    onOverlayUsed: () => void;
};

const CHATTERINO_HEADER_HEIGHT = 28;
const FOCUS_BORDER_ALPHA = 0.55;

function headerHeightOf(tokens: ModernTokens | undefined, framed: boolean): number {
    if (!tokens) return CHATTERINO_HEADER_HEIGHT;
    return framed ? MODERN_COMPACT_HEADER_HEIGHT : MODERN_HEADER_HEIGHT;
}

function frameStyle(tokens: ModernTokens | undefined, framed: boolean, focused: boolean) {
    if (!tokens) return { padding: 1 };
    if (!framed) return {};
    const borderColor = focused ? withAlpha(tokens.accent, FOCUS_BORDER_ALPHA) : tokens.lineSubtle;
    return { borderWidth: 1, borderColor, borderRadius: 6, overflow: "hidden" as const };
}

export function SplitView({ split, tabId, rect, pageOrigin, focused, isTopRight, framed = false, ghost, overlay, zoomWheel, onOverlayUsed }: Props) {
    const services = useApp();
    const { core, theme, actions } = services;
    const channel = useChannel(core, split.channel);
    const view = useSplitChannel(core, channel, { filters: split.filters, moderationMode: split.moderationMode });
    const info = useChannelInfo(channel, services.channelInfos);
    const drag = useStore(services.drag);
    const [overlayDragging, setOverlayDragging] = useState(false);
    const input = useRef<SplitInputHandle>(null);
    const chat = useRef<ChatViewHandle>(null);
    const keepOverlay = overlayDragging && drag?.splitId === split.id;

    useEffect(() => {
        if (overlayDragging && !drag) setOverlayDragging(false);
    }, [overlayDragging, drag]);

    useEffect(
        () =>
            inputRegistry.register(split.id, {
                focus: () => input.current?.focus(),
                insert: (text) => input.current?.insert(text),
                mention: (name) => input.current?.mention(name),
                reply: (target) => input.current?.reply(target),
                command: (command) => input.current?.command(command) ?? false,
                scrollToBottom: () => chat.current?.scrollToBottom(),
            }),
        [split.id],
    );

    const tokens = theme.modern;
    const OverlayView = tokens ? ModernSplitOverlay : SplitOverlay;
    const headerRect: Rect = { x: pageOrigin.x + rect.x + 1, y: pageOrigin.y + rect.y + 1, width: rect.width - 2, height: headerHeightOf(tokens, framed) };

    return (
        <View
            testID={`split-${split.id}`}
            accessibilityLabel={split.channel || "<empty>"}
            style={{
                position: "absolute",
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
                ...frameStyle(tokens, framed, focused),
                backgroundColor: theme.splits.background,
                opacity: ghost ? 0 : 1,
                zIndex: ghost ? -1 : 0,
            }}
            onMouseDown={() => actions.focusSplit(split.id)}
        >
            <SplitHeader
                split={split}
                tabId={tabId}
                channel={channel}
                info={info}
                focused={focused}
                isTopRight={isTopRight}
                rect={headerRect}
                compact={framed}
                onClear={() => channel?.clear()}
            />
            <ChatView ref={chat} channel={view} source={channel} splitId={split.id} tabId={tabId} channelName={split.channel} zoomWheel={zoomWheel} />
            <SplitInput ref={input} splitId={split.id} channel={channel} channelName={split.channel} compact={framed} />
            {overlay || keepOverlay ? (
                <OverlayView
                    splitId={split.id}
                    tabId={tabId}
                    width={rect.width}
                    height={rect.height}
                    onInsert={(direction) => {
                        onOverlayUsed();
                        actions.insertEmptySplit(split.id, direction);
                    }}
                    onDragStart={() => {
                        setOverlayDragging(true);
                        onOverlayUsed();
                    }}
                />
            ) : null}
        </View>
    );
}
