import { useEffect, useRef, useState } from "react";
import { Text, View, type TextInputHandle } from "@felipe-software/react-native-gpui";
import type { ChatListMessage, ChatListPressEvent } from "../../native/chatList";
import type { Channel } from "../../data/api";
import { FeedList } from "../common/FeedList";
import { FloatingWindow } from "../common/FloatingWindow";
import { TextField } from "../common/TextField";
import { SearchHeader } from "../modern/popups/SearchHeader";
import { parseSearchQuery, resultCount, searchMessages, searchScope } from "../modern/popups/searchQuery";
import { SearchResults } from "../modern/popups/SearchResults";
import { useApp, type Core } from "../state/AppContext";
import { MENTIONS_CHANNEL } from "../state/ids";
import { chromeColors } from "../theme";

type Props = { channels: string[]; onClose: () => void };

const DEBOUNCE_MS = 150;
const MODERN_WIDTH = 440;
const MODERN_HEIGHT = 640;
const CARD_HINT = "Click a name to open their user card";

function titleFor(channels: string[]): string {
    if (channels.length > 1) return "Searching in multiple channels' history";
    const [channel] = channels;
    if (channel === MENTIONS_CHANNEL) return "Searching in Mentions";
    return `Searching in ${channel}'s history`;
}

function lookup(core: Core, name: string): { channel: Channel; joined: boolean } | undefined {
    if (!name) return undefined;
    if (name === MENTIONS_CHANNEL) return { channel: core.mentions, joined: false };
    return { channel: core.join(name), joined: true };
}

export function SearchPopup({ channels, onClose }: Props) {
    const { core, theme, fonts, openOverlay, openUrl } = useApp();
    const colors = chromeColors(theme);
    const tokens = theme.modern;
    const input = useRef<TextInputHandle>(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ChatListMessage[]>([]);
    const [sources, setSources] = useState<Channel[]>([]);

    useEffect(() => {
        const unique = [...new Set(channels.filter(Boolean))];
        const entries = unique.map((name) => lookup(core, name)).filter((entry): entry is { channel: Channel; joined: boolean } => !!entry);
        setSources(entries.map((entry) => entry.channel));
        return () => {
            for (const entry of entries) if (entry.joined) core.leave(entry.channel.name);
        };
    }, [core, channels.join(",")]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const searching = query.trim().length > 0;
            const classic = () => sources.flatMap((channel) => (searching ? channel.search(query) : channel.snapshot()));
            setResults(tokens ? searchMessages(sources, query) : classic());
        }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [query, sources, tokens]);

    const hasQuery = query.trim().length > 0;

    if (tokens) {
        const unique = [...new Set(channels.filter(Boolean))];
        const cardChannel = unique.length === 1 ? unique[0] : undefined;
        const scope = searchScope(channels, MENTIONS_CHANNEL);
        const noMatches = hasQuery && results.length === 0;
        const empty = noMatches ? { title: "No messages found", description: `Nothing in ${scope} matches "${query.trim()}".` } : undefined;
        const press = (event: ChatListPressEvent) => {
            if (event.button !== "left") return;
            if (event.target === "link" && event.url && !event.url.startsWith("chatterino://")) {
                openUrl(event.url);
                return;
            }
            if (event.target === "user" && event.login && cardChannel) openOverlay({ kind: "userCard", login: event.login, channel: cardChannel, x: event.x, y: event.y });
        };
        return (
            <FloatingWindow
                testID="search-popup"
                title={titleFor(channels)}
                width={MODERN_WIDTH}
                height={MODERN_HEIGHT}
                header={<SearchHeader query={query} inputRef={input} onQuery={setQuery} />}
                onClose={onClose}
            >
                <SearchResults
                    results={results}
                    highlight={parseSearchQuery(query).text}
                    countText={resultCount(results.length, scope)}
                    empty={empty}
                    hint={cardChannel ? CARD_HINT : undefined}
                    onPress={press}
                />
            </FloatingWindow>
        );
    }

    return (
        <FloatingWindow testID="search-popup" title={titleFor(channels)} width={400} height={600} onClose={onClose}>
            <View style={{ padding: 8 }}>
                <TextField testID="search-input" value={query} placeholder="Type to search" autoFocus onChange={setQuery} />
            </View>
            <View style={{ flex: 1 }}>
                <FeedList testID="search-results" messages={results} />
                {hasQuery && results.length === 0 ? (
                    <View style={{ position: "absolute", left: 0, right: 0, top: 16, alignItems: "center" }} pointerEvents="none">
                        <Text style={{ color: colors.muted, fontFamily: fonts.appFamily, fontSize: fonts.appSize }}>No messages found</Text>
                    </View>
                ) : null}
            </View>
        </FloatingWindow>
    );
}
