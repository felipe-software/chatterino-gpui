import { describe, expect, test } from "bun:test";
import type { ChatListMessage } from "../../../native/chatList";
import {
    hasFilters,
    highlightMatches,
    matchesFilters,
    parseSearchQuery,
    resultCount,
    searchMessages,
    searchScope,
    toggleFrom,
    toggleHasLink,
} from "./searchQuery";

function message(login: string, link?: string): ChatListMessage {
    const body = link ? { kind: "text" as const, text: link, link } : { kind: "text" as const, text: "hello there" };
    return {
        id: `${login}-${link ?? "plain"}`,
        elements: [{ kind: "badge", name: "vip", url: "", width: 18, height: 18 }, { kind: "user", text: `${login}:`, login }, body],
    };
}

describe("search filters (from:, has:link)", () => {
    test("filters are pulled out of the text", () => {
        expect(parseSearchQuery("from:Forsen,@xqc route has:link")).toEqual({ text: "route", from: ["forsen", "xqc"], hasLink: true });
        expect(parseSearchQuery("from: route")).toEqual({ text: "route", from: [], hasLink: false });
        expect(hasFilters(parseSearchQuery("plain words"))).toBe(false);
    });

    test("messages match on the author and links", () => {
        const query = parseSearchQuery("from:forsen has:link");
        expect(matchesFilters(message("forsen", "https://twitch.tv"), query)).toBe(true);
        expect(matchesFilters(message("forsen"), query)).toBe(false);
        expect(matchesFilters(message("xqc", "https://twitch.tv"), query)).toBe(false);
        expect(matchesFilters(message("forsen", "chatterino://thread/1"), parseSearchQuery("has:link"))).toBe(false);
    });

    test("filters narrow the channel's text search or its whole history", () => {
        const all = [message("forsen", "https://twitch.tv"), message("forsen"), message("xqc")];
        const searched: string[] = [];
        const source = {
            search: (text: string) => {
                searched.push(text);
                return all.slice(0, 2);
            },
            snapshot: () => all,
        };
        expect(searchMessages([source], "from:xqc").map((entry) => entry.id)).toEqual(["xqc-plain"]);
        expect(searchMessages([source], "hello has:link").map((entry) => entry.id)).toEqual(["forsen-https://twitch.tv"]);
        expect(searched).toEqual(["hello"]);
        expect(searchMessages([source], "")).toHaveLength(3);
    });

    test("the count line names where it searched", () => {
        expect(resultCount(1, searchScope(["forsen"], "/mentions"))).toBe("1 message in #forsen");
        expect(resultCount(1204, searchScope(["forsen", "xqc", "forsen"], "/mentions"))).toBe("1,204 messages in 2 channels");
        expect(searchScope(["/mentions"], "/mentions")).toBe("Mentions");
    });

    test("matches are split out and coloured, links and names stay whole", () => {
        const source: ChatListMessage = {
            id: "m",
            elements: [
                { kind: "user", text: "route:", login: "route" },
                { kind: "text", text: "Routes?", color: "#fff" },
                { kind: "text", text: "route.com", link: "https://route.com" },
            ],
        };
        const result = highlightMatches(source, "route", "#4EBDF7");
        expect(result.elements.map((element) => (element.kind === "text" || element.kind === "user" ? element.text : ""))).toEqual(["route:", "Route", "s?", "route.com"]);
        expect(result.elements[1]).toMatchObject({ color: "#4EBDF7", bold: true, trailingSpace: false });
        expect(result.elements[2]).toMatchObject({ color: "#fff", trailingSpace: undefined });
        expect(highlightMatches(source, "nothing", "#000")).toBe(source);
    });

    test("words around a match keep their spaces", () => {
        const source: ChatListMessage = { id: "m", elements: [{ kind: "text", text: "they have the same name" }] };
        const result = highlightMatches(source, "the", "#4EBDF7");
        const pieces = result.elements.map((element) => (element.kind === "text" ? [element.text, element.trailingSpace, !!element.bold] : []));
        expect(pieces).toEqual([
            ["the", false, true],
            ["y have", true, false],
            ["the", true, true],
            ["same name", undefined, false],
        ]);
    });

    test("chips toggle their filter", () => {
        expect(toggleHasLink("route")).toBe("route has:link");
        expect(toggleHasLink("route has:link")).toBe("route");
        expect(toggleFrom("route")).toBe("route from:");
        expect(toggleFrom("route from:forsen")).toBe("route");
    });
});
