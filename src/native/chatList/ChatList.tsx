import { forwardRef, useImperativeHandle, useMemo } from "react";
import { useNativeElement } from "@felipe-software/react-native-gpui";
import { ChatListHost } from "./chatListHost";
import type { ChatListHandle, ChatListProps } from "./types";

export const ChatList = forwardRef<ChatListHandle, ChatListProps>(function ChatList(props, ref) {
    const native = useNativeElement(ChatListHost.type);
    const handle = useMemo<ChatListHandle>(
        () => ({
            append(messages) {
                if (messages.length > 0) native.send("append", { messages });
            },
            prepend(messages) {
                if (messages.length > 0) native.send("prepend", { messages });
            },
            update(patches) {
                if (patches.length > 0) native.send("update", { patches });
            },
            clear() {
                native.send("clear");
            },
            scrollToBottom() {
                native.send("scrollToBottom");
            },
            scrollToTop() {
                native.send("scrollToTop");
            },
            scrollToMessage(messageId, options) {
                native.send("scrollToMessage", { messageId, align: options?.align });
            },
            pageUp() {
                native.send("page", { direction: -1 });
            },
            pageDown() {
                native.send("page", { direction: 1 });
            },
        }),
        [native],
    );
    useImperativeHandle(ref, () => handle, [handle]);
    return <ChatListHost {...props} nativeElementId={native.id} />;
});
