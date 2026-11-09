import { useMemo } from "react";
import type { ChatListMessage } from "../../../native/chatList";
import { useApp } from "../../state/AppContext";
import { useMessageRecolor } from "../splits/useMessageRecolor";

export type FeedSubscribe = (append: (messages: ChatListMessage[]) => void) => () => void;

export type RecoloredFeed = { messages: ChatListMessage[]; subscribe?: FeedSubscribe };

export function useRecoloredFeed(messages: ChatListMessage[], subscribe?: FeedSubscribe): RecoloredFeed {
    const { theme, settings } = useApp();
    const recolor = useMessageRecolor(theme.modern, settings);
    const shown = useMemo(() => (recolor ? messages.map(recolor.message) : messages), [messages, recolor]);
    const recoloredSubscribe = useMemo<FeedSubscribe | undefined>(() => {
        if (!subscribe || !recolor) return subscribe;
        return (append) => subscribe((next) => append(next.map(recolor.message)));
    }, [subscribe, recolor]);
    return { messages: shown, subscribe: recoloredSubscribe };
}
