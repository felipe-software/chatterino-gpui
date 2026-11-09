import type { ChatListBadgeElement, ChatListMessage } from "../../../native/chatList";
import type { TimeoutButton, TimeoutUnit, WindowLayout } from "../../../data/api";
import { splitLeaves } from "../../layout/tree";
import { authorOf } from "../../splits/replyTarget";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const UNIT_SECONDS: Record<TimeoutUnit, number> = { s: 1, m: 60, h: 3600, d: 86_400, w: 604_800 };

export function monthYear(time: number): string {
    const date = new Date(time);
    return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function sinceYear(time: number): string {
    return `Since ${new Date(time).getFullYear()}`;
}

export function timeoutLabel(button: TimeoutButton): string {
    return `${button.value}${button.unit}`;
}

export function timeoutSeconds(button: TimeoutButton): number {
    return button.value * UNIT_SECONDS[button.unit];
}

export type AuthorLook = { color?: string; badges: ChatListBadgeElement[] };

export function authorLook(messages: ChatListMessage[]): AuthorLook {
    const latest = messages[messages.length - 1];
    if (!latest) return { badges: [] };
    const author = authorOf(latest);
    const authorIndex = author ? latest.elements.indexOf(author) : 0;
    const badges = latest.elements.slice(0, Math.max(0, authorIndex)).filter((element): element is ChatListBadgeElement => element.kind === "badge");
    return { color: author?.color, badges };
}

export function splitForChannel(layout: WindowLayout, channel: string): string | undefined {
    const selected = layout.tabs.find((tab) => tab.id === layout.selectedTabId);
    const ordered = selected ? [selected, ...layout.tabs.filter((tab) => tab !== selected)] : layout.tabs;
    for (const tab of ordered) {
        const leaves = splitLeaves(tab.root).filter((leaf) => leaf.channel === channel);
        const focused = leaves.find((leaf) => leaf.id === tab.focusedSplitId);
        const match = focused ?? leaves[0];
        if (match) return match.id;
    }
    return undefined;
}
