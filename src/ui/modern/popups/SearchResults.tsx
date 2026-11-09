import { useMemo } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import type { ChatListMessage, ChatListPressEvent } from "../../../native/chatList";
import { FeedList } from "../../common/FeedList";
import { useApp } from "../../state/AppContext";
import { DialogFooter } from "../controls/DialogFooter";
import { Divider } from "../controls/Divider";
import { EmptyState } from "../controls/EmptyState";
import { Kbd } from "../controls/Kbd";
import { useModernTokens } from "../controls/useModernTokens";
import { highlightMatches } from "./searchQuery";
import { useRecoloredFeed } from "./useRecoloredFeed";

type Props = {
    results: ChatListMessage[];
    highlight: string;
    countText: string;
    empty?: { title: string; description: string };
    hint?: string;
    onPress?: (event: ChatListPressEvent) => void;
};

const LIST_INSET = 6;

export function SearchResults({ results, highlight, countText, empty, hint, onPress }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const feed = useRecoloredFeed(results);
    const shown = useMemo(
        () => (highlight ? feed.messages.map((message) => highlightMatches(message, highlight, tokens.accent)) : feed.messages),
        [feed.messages, highlight, tokens.accent],
    );
    const small = { color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 };
    return (
        <View style={{ flex: 1 }}>
            <Divider />
            <View style={{ paddingTop: 10, paddingBottom: 4, paddingHorizontal: 14 }}>
                <Text testID="search-count" numberOfLines={1} style={small}>
                    {countText}
                </Text>
            </View>
            <View style={{ flex: 1, minHeight: 0, paddingLeft: LIST_INSET }}>
                <FeedList testID="search-results" messages={shown} background={tokens.bgRaised} onPress={onPress} />
                {empty ? (
                    <View style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }} pointerEvents="none">
                        <EmptyState testID="search-empty" title={empty.title} description={empty.description} />
                    </View>
                ) : null}
            </View>
            <DialogFooter hint={hint}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Kbd label="Esc" size="sm" />
                    <Text style={small}>to close</Text>
                </View>
            </DialogFooter>
        </View>
    );
}
