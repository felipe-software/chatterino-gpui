import { defineNativeComponent } from "@felipe-software/react-native-gpui";
import type { ChatListProps } from "./types";

export const ChatListHost = defineNativeComponent<ChatListProps>({
    type: "chatlist",
    props: {
        textColor: "color",
        mutedColor: "color",
        linkColor: "color",
        selectionColor: "color",
        separatorColor: "color",
        alternateBackground: "color",
        scrollbarColor: "color",
        fontSize: "number",
        disabledOpacity: "number",
        historicalOpacity: "number",
        emoteScale: "number",
        maxMessages: "number",
        showTimestamps: "boolean",
        animateEmotes: "boolean",
        pauseOnHover: "boolean",
        fontFamily: "string",
    },
    events: {
        onPress: "chatListPress",
        onHover: "chatListHover",
        onScrollState: "chatListScroll",
    },
});
