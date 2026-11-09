import { describe, expect, test } from "bun:test";
import type { ChatListMessage } from "../../../native/chatList";
import { defaultSettings } from "../../../data";
import type { Settings } from "../../../data/api";
import { COLOR_SELF_HIGHLIGHT } from "../../../data/filters/highlights";
import { createMessage } from "../../../data/messages/builder";
import type { MessageFlags, Piece } from "../../../data/messages/model";
import { renderMessage } from "../../../data/messages/render";
import { blendColors, formatColor, opaque, parseColor } from "../../../data/util/colors";
import { modernTokens } from "../tokens";
import { createMessageRecolor } from "./messageColors";
import { readableNameColor } from "./readableColor";

function rendered(settings: Settings, pieces: Piece[], flags: MessageFlags = {}, highlightColor?: string): ChatListMessage {
    const message = createMessage({ channel: "pajlada", time: 0, pieces, flags, text: "hi", login: "orbitkit", displayName: "orbitkit" });
    if (highlightColor) message.highlightColor = highlightColor;
    return renderMessage(message, { theme: settings.theme, timestampFormat: "HH:mm", showBadges: true, showChannelName: false, hideModerated: false, settings });
}

const NAME: Piece = { kind: "user", text: "orbitkit:", login: "orbitkit", tint: "#0000ff", bold: true };
const BODY: Piece = { kind: "text", text: "hi", tint: "text" };

describe("readable username colours (design: OKLCH lightness 0.72+ dark, 0.53- light, chroma 0.16-)", () => {
    test("lifts dark-theme names to the design's samples", () => {
        expect(readableNameColor("#8A2BE2", "dark")).toBe("#b78af8");
        expect(readableNameColor("#008000", "dark")).toBe("#62bd5c");
        expect(readableNameColor("#B22222", "black")).toBe("#f9786d");
        expect(readableNameColor("#2E8B57", "dark")).toBe("#61ba83");
    });

    test("darkens light-theme names to the design's samples", () => {
        expect(readableNameColor("#0000FF", "light")).toBe("#264dad");
        expect(readableNameColor("#8A2BE2", "light")).toBe("#7d4fb8");
        expect(readableNameColor("#008000", "light")).toBe("#1d7e1a");
        expect(readableNameColor("#2E8B57", "light")).toBe("#1f7f4c");
    });

    test("leaves colours that already pass alone", () => {
        expect(readableNameColor("#DAA520", "dark")).toBe("#DAA520");
        expect(readableNameColor("#264dad", "light")).toBe("#264dad");
        expect(readableNameColor("not a colour", "light")).toBe("not a colour");
    });
});

describe("modern message recolouring", () => {
    const dark = modernTokens("dark", "sky");
    const light = modernTokens("light", "sky");

    test("first messages, subs and mentions get the design tints and markers", () => {
        const settings = { ...defaultSettings("linux"), theme: "dark" as const };
        const recolor = createMessageRecolor(dark, settings);
        const first = recolor.message(rendered(settings, [NAME, BODY], { firstMessage: true }));
        const sub = recolor.message(rendered(settings, [NAME, BODY], { subscription: true }));
        const mention = recolor.message(rendered(settings, [NAME, BODY], { highlighted: true }, COLOR_SELF_HIGHLIGHT));
        expect(first.background).toBe(dark.firstTint);
        expect(first.marker).toBe(dark.first);
        expect(sub.background).toBe(dark.subTint);
        expect(sub.marker).toBe(dark.sub);
        expect(mention.background).toBe(dark.mentionTint);
        expect(mention.marker).toBe(dark.mention);
    });

    test("light theme maps the light palette's blends", () => {
        const settings = { ...defaultSettings("linux"), theme: "light" as const };
        const recolor = createMessageRecolor(light, settings);
        const first = recolor.message(rendered(settings, [NAME, BODY], { firstMessage: true }));
        expect(first.background).toBe(light.firstTint);
    });

    test("custom highlight colours are re-blended onto the modern chat background", () => {
        const custom = "#ff000080";
        const settings = { ...defaultSettings("linux"), theme: "dark" as const, highlightPhrases: [{ pattern: "hi", isRegex: false, caseSensitive: false, color: custom, playSound: false, alert: false, showInMentions: false }] };
        const recolor = createMessageRecolor(dark, settings as Settings);
        const message = recolor.message(rendered(settings as Settings, [NAME, BODY], { highlighted: true }, custom));
        const source = parseColor(custom)!;
        expect(message.background).toBe(formatColor(blendColors(parseColor(dark.bgChat)!, source)));
        expect(message.marker).toBe(formatColor(opaque(source)));
    });

    test("system text becomes text3, links the accent and names readable", () => {
        const settings = { ...defaultSettings("linux"), theme: "light" as const };
        const recolor = createMessageRecolor(light, settings);
        const system: Piece = { kind: "text", text: "joined", tint: "system" };
        const link: Piece = { kind: "text", text: "example.com", tint: "link", link: "https://example.com" };
        const message = recolor.message(rendered(settings, [NAME, system, link]));
        const [name, systemText, linkText] = message.elements;
        expect(systemText.kind === "text" && systemText.color).toBe(light.text3);
        expect(linkText.kind === "text" && linkText.color).toBe(light.accent);
        expect(name.kind === "user" && name.color).toBe("#264dad");
    });

    test("patches keep their id and only touch the fields they carry", () => {
        const settings = { ...defaultSettings("linux"), theme: "dark" as const };
        const recolor = createMessageRecolor(dark, settings);
        expect(recolor.patch({ id: "a", disabled: true })).toEqual({ id: "a", disabled: true });
    });
});
