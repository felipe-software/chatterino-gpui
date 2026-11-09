import type { ChatListMessage } from "../../../native/chatList";
import { authorOf } from "../../splits/replyTarget";

export type SearchQuery = { text: string; from: string[]; hasLink: boolean };

const FROM = "from:";
const HAS_LINK = "has:link";

export function parseSearchQuery(raw: string): SearchQuery {
    const from: string[] = [];
    const words: string[] = [];
    let hasLink = false;
    for (const word of raw.trim().split(/\s+/).filter(Boolean)) {
        const lower = word.toLowerCase();
        if (lower === HAS_LINK) {
            hasLink = true;
            continue;
        }
        if (lower.startsWith(FROM)) {
            const names = lower
                .slice(FROM.length)
                .split(",")
                .map((name) => name.replace(/^@/, ""))
                .filter(Boolean);
            from.push(...names);
            continue;
        }
        words.push(word);
    }
    return { text: words.join(" "), from, hasLink };
}

export function hasFilters(query: SearchQuery): boolean {
    return query.from.length > 0 || query.hasLink;
}

function hasLink(message: ChatListMessage): boolean {
    return message.elements.some((element) => element.kind === "text" && !!element.link && !element.link.startsWith("chatterino://"));
}

export function matchesFilters(message: ChatListMessage, query: SearchQuery): boolean {
    if (query.from.length > 0) {
        const login = authorOf(message)?.login.toLowerCase();
        if (!login || !query.from.includes(login)) return false;
    }
    if (query.hasLink && !hasLink(message)) return false;
    return true;
}

type Searchable = { search(query: string): ChatListMessage[]; snapshot(): ChatListMessage[] };

export function searchMessages(sources: Searchable[], raw: string): ChatListMessage[] {
    const query = parseSearchQuery(raw);
    const filtered = hasFilters(query);
    const base = sources.flatMap((source) => (query.text ? source.search(query.text) : source.snapshot()));
    return filtered ? base.filter((message) => matchesFilters(message, query)) : base;
}

type Piece = { text: string; match: boolean };

function splitMatches(text: string, needles: string[]): Piece[] {
    const lower = text.toLowerCase();
    const pieces: Piece[] = [];
    let start = 0;
    let cursor = 0;
    while (cursor < text.length) {
        const needle = needles.find((candidate) => lower.startsWith(candidate, cursor));
        if (!needle) {
            cursor += 1;
            continue;
        }
        if (cursor > start) pieces.push({ text: text.slice(start, cursor), match: false });
        pieces.push({ text: text.slice(cursor, cursor + needle.length), match: true });
        cursor += needle.length;
        start = cursor;
    }
    if (start < text.length) pieces.push({ text: text.slice(start), match: false });
    return pieces;
}

type SpacedPiece = Piece & { leading: boolean; trailing: boolean };

function spaced(pieces: Piece[]): SpacedPiece[] {
    return pieces.map((piece) => ({ match: piece.match, text: piece.text.trim(), leading: /^\s/.test(piece.text), trailing: /\s$/.test(piece.text) }));
}

export function highlightMatches(message: ChatListMessage, text: string, color: string): ChatListMessage {
    const needles = [...new Set(text.toLowerCase().split(/\s+/).filter(Boolean))].sort((a, b) => b.length - a.length);
    if (needles.length === 0) return message;
    let changed = false;
    const elements = message.elements.flatMap((element) => {
        if (element.kind !== "text" || element.link) return [element];
        const pieces = splitMatches(element.text, needles);
        if (!pieces.some((piece) => piece.match)) return [element];
        changed = true;
        const parts = spaced(pieces);
        const lastIndex = parts.length - 1;
        return parts.flatMap((part, index) => {
            if (!part.text) return [];
            const nextLeading = parts[index + 1]?.leading ?? false;
            const spacing = index === lastIndex ? element.trailingSpace : part.trailing || nextLeading;
            const look = part.match ? { color, bold: true } : {};
            return [{ ...element, ...look, text: part.text, trailingSpace: spacing }];
        });
    });
    return changed ? { ...message, elements } : message;
}

export function searchScope(channels: string[], mentionsChannel: string): string {
    const unique = [...new Set(channels.filter(Boolean))];
    if (unique.length > 1) return `${unique.length} channels`;
    const [channel] = unique;
    if (!channel) return "this split";
    if (channel === mentionsChannel) return "Mentions";
    return `#${channel}`;
}

export function resultCount(count: number, scope: string): string {
    const noun = count === 1 ? "message" : "messages";
    return `${count.toLocaleString("en-US")} ${noun} in ${scope}`;
}

function wordsOf(raw: string): string[] {
    return raw.trim().split(/\s+/).filter(Boolean);
}

export function toggleHasLink(raw: string): string {
    const words = wordsOf(raw);
    const present = words.some((word) => word.toLowerCase() === HAS_LINK);
    const next = present ? words.filter((word) => word.toLowerCase() !== HAS_LINK) : [...words, HAS_LINK];
    return next.join(" ");
}

export function toggleFrom(raw: string): string {
    const words = wordsOf(raw);
    const isFrom = (word: string) => word.toLowerCase().startsWith(FROM);
    if (words.some(isFrom)) return words.filter((word) => !isFrom(word)).join(" ");
    return [...words, FROM].join(" ");
}
