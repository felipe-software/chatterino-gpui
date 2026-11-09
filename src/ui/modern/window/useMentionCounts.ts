import { useEffect, useRef, useState } from "react";
import type { ChatListMessage } from "../../../native/chatList";
import type { WindowLayout } from "../../../data/api";
import { splitLeaves } from "../../layout/tree";
import { useApp } from "../../state/AppContext";
import { MENTIONS_CHANNEL } from "../../state/ids";

const CHANNEL_LINK = "chatterino://channel/";

type Counts = Record<string, number>;

function sourceChannel(message: ChatListMessage): string | undefined {
    const first = message.elements[0];
    const link = first?.kind === "text" ? first.link : undefined;
    if (!link?.startsWith(CHANNEL_LINK)) return undefined;
    return link.slice(CHANNEL_LINK.length);
}

function countsFor(messages: ChatListMessage[], layout: WindowLayout, mutedTabs: string[]): Counts {
    const added: Counts = {};
    for (const message of messages) {
        if (message.historical) continue;
        const channel = sourceChannel(message);
        for (const tab of layout.tabs) {
            const skip = tab.id === layout.selectedTabId || mutedTabs.includes(tab.id);
            if (skip) continue;
            const channels = splitLeaves(tab.root).map((leaf) => leaf.channel);
            const relevant = channels.includes(MENTIONS_CHANNEL) || (!!channel && channels.includes(channel));
            if (relevant) added[tab.id] = (added[tab.id] ?? 0) + 1;
        }
    }
    return added;
}

function merge(current: Counts, added: Counts): Counts {
    const next = { ...current };
    for (const [tabId, count] of Object.entries(added)) next[tabId] = (next[tabId] ?? 0) + count;
    return next;
}

export function useMentionCounts(layout: WindowLayout): Counts {
    const { core, prefs } = useApp();
    const [counts, setCounts] = useState<Counts>({});
    const latest = useRef({ layout, mutedTabs: prefs.mutedTabs });
    latest.current = { layout, mutedTabs: prefs.mutedTabs };

    useEffect(
        () =>
            core.mentions.subscribe((event) => {
                if (event.type !== "append") return;
                const added = countsFor(event.messages, latest.current.layout, latest.current.mutedTabs);
                if (Object.keys(added).length > 0) setCounts((current) => merge(current, added));
            }),
        [core],
    );

    useEffect(() => {
        const selected = layout.selectedTabId;
        setCounts((current) => {
            if (!current[selected]) return current;
            const next = { ...current };
            delete next[selected];
            return next;
        });
    }, [layout.selectedTabId]);

    return counts;
}
