import { useEffect, useMemo, useState } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import type { ChatListMessage } from "../../../native/chatList";
import { FeedList } from "../../common/FeedList";
import { useApp } from "../../state/AppContext";
import { EmptyState } from "../controls/EmptyState";
import { useModernTokens } from "../controls/useModernTokens";
import { useRecoloredFeed, type FeedSubscribe } from "./useRecoloredFeed";

type Props = { title: string; messages: ChatListMessage[]; subscribe?: FeedSubscribe; showList: boolean };

const LIST_INSET = 2;

export function RecentMessages({ title, messages, subscribe, showList }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const [added, setAdded] = useState(0);
    useEffect(() => setAdded(0), [messages]);
    const counted = useMemo<FeedSubscribe | undefined>(() => {
        if (!subscribe) return undefined;
        return (append) =>
            subscribe((next) => {
                append(next);
                setAdded((current) => current + next.length);
            });
    }, [subscribe]);
    const feed = useRecoloredFeed(messages, counted);
    const count = messages.length + added;
    const label = { fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 };
    return (
        <View style={{ flex: 1, minHeight: 0, borderTopWidth: 1, borderTopColor: tokens.lineSubtle, backgroundColor: tokens.bgChat }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingTop: 8, paddingBottom: 4, paddingHorizontal: 12 }}>
                <Text numberOfLines={1} style={{ ...label, flexShrink: 1, color: tokens.text2, fontWeight: "600" }}>
                    {title}
                </Text>
                <Text testID="user-card-session-count" style={{ ...label, color: tokens.text3 }}>{count === 1 ? "1 this session" : `${count} this session`}</Text>
            </View>
            <View style={{ flex: 1, minHeight: 0, paddingLeft: LIST_INSET }}>
                {showList ? <FeedList testID="user-card-messages" messages={feed.messages} subscribe={feed.subscribe} /> : null}
                {count === 0 ? (
                    <View style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }} pointerEvents="none">
                        <EmptyState title="No recent messages" />
                    </View>
                ) : null}
            </View>
        </View>
    );
}
