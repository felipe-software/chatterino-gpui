import { useEffect, useMemo, useRef, useState } from "react";
import { View, type LayoutChangeEvent } from "@felipe-software/react-native-gpui";
import type { SplitLeaf } from "../../data/api";
import type { Rect } from "../layout/geometry";
import { MODERN_HEADER_HEIGHT } from "../modern/splits/ModernSplitHeader";
import { useApp } from "../state/AppContext";
import { inputRegistry } from "../state/inputs";
import { useChannel, useChannelInfo } from "../state/useChannel";
import { ChatView, type ChatViewHandle } from "./ChatView";
import { SplitHeader } from "./SplitHeader";
import { SplitInput, type SplitInputHandle } from "./SplitInput";

type Props = { popupId: string; channel: string; onClose: () => void };

export function PopupSplit({ popupId, channel: channelName, onClose }: Props) {
    const services = useApp();
    const { core, theme } = services;
    const channel = useChannel(core, channelName);
    const info = useChannelInfo(channel, services.channelInfos);
    const input = useRef<SplitInputHandle>(null);
    const chat = useRef<ChatViewHandle>(null);
    const [headerRect, setHeaderRect] = useState<Rect>({ x: 0, y: 0, width: 0, height: 28 });
    const split = useMemo<SplitLeaf>(() => ({ type: "split", id: popupId, channel: channelName }), [popupId, channelName]);

    useEffect(
        () =>
            inputRegistry.register(popupId, {
                focus: () => input.current?.focus(),
                insert: (text) => input.current?.insert(text),
                mention: (name) => input.current?.mention(name),
                reply: (target) => input.current?.reply(target),
                command: (command) => input.current?.command(command) ?? false,
                scrollToBottom: () => chat.current?.scrollToBottom(),
            }),
        [popupId],
    );

    useEffect(() => {
        const timer = setTimeout(() => input.current?.focus(), 50);
        return () => clearTimeout(timer);
    }, []);

    const headerHeight = theme.modern ? MODERN_HEADER_HEIGHT : 28;
    const measureHeader = (event: LayoutChangeEvent) => {
        const layout = event.nativeEvent.layout;
        setHeaderRect({ x: layout.x, y: layout.y, width: layout.width, height: headerHeight });
    };

    return (
        <View testID={`popup-split-${popupId}`} style={{ flex: 1, padding: theme.modern ? 0 : 1, backgroundColor: theme.splits.background }}>
            <View onLayout={measureHeader}>
                <SplitHeader
                    split={split}
                    tabId={popupId}
                    channel={channel}
                    info={info}
                    focused
                    isTopRight={false}
                    rect={headerRect}
                    detached
                    onClear={() => channel?.clear()}
                    onClosePopup={onClose}
                />
            </View>
            <ChatView ref={chat} channel={channel} source={channel} splitId={popupId} tabId={popupId} channelName={channelName} />
            <SplitInput ref={input} splitId={popupId} channel={channel} channelName={channelName} />
        </View>
    );
}
