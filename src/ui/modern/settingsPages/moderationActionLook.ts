import type { ModerationAction } from "../../../data/api";
import { parseModerationAction } from "../../../data/twitch/moderation-actions";
import type { ModernTokens } from "../tokens";
import { PAGE_ICONS } from "./pageIcons";

export type ActionLook = { label: string; icon?: string; image?: string; text?: string; tint: string };

const TIMEOUT = /^[./]timeout\S*\s+\S+\s+(\d+)([smhdw]?)/i;
const UNIT_SECONDS: Record<string, number> = { "": 1, s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
const UNIT_WORDS: Array<[number, string]> = [
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
    [1, "second"],
];

function durationWords(seconds: number): string {
    const [size, word] = UNIT_WORDS.find(([unit]) => seconds % unit === 0 && seconds >= unit) ?? [1, "second"];
    const count = Math.round(seconds / size);
    return `${count} ${word}${count === 1 ? "" : "s"}`;
}

const COMMAND_LABELS: Record<string, string> = { w: "Whisper", vip: "VIP", unvip: "Remove VIP", mod: "Mod", unmod: "Unmod", shoutout: "Shoutout" };

function commandWord(action: string): string {
    const word =
        action
            .trim()
            .split(/\s+/)[0]
            ?.replace(/^[./!]/, "") ?? "";
    if (!word) return action;
    return COMMAND_LABELS[word.toLowerCase()] ?? word.charAt(0).toUpperCase() + word.slice(1);
}

export function moderationActionLook(action: ModerationAction, tokens: ModernTokens): ActionLook {
    const parsed = parseModerationAction(action);
    const command = action.action.trim().toLowerCase();
    const timeout = TIMEOUT.exec(action.action.trim());
    const seconds = timeout ? Number(timeout[1]) * UNIT_SECONDS[timeout[2].toLowerCase()] : 0;
    const label = timeout ? (seconds === 1 ? "Purge" : durationWords(seconds)) : commandWord(action.action);
    if (action.iconPath && parsed.kind === "image") return { label, image: parsed.url, tint: tokens.text2 };
    if (timeout && seconds === 1) return { label, icon: PAGE_ICONS.purge, tint: tokens.text2 };
    if (timeout) return { label, icon: PAGE_ICONS.clock, tint: tokens.warn };
    if (command.startsWith("/ban ") || command === "/ban") return { label, icon: PAGE_ICONS.ban, tint: tokens.mention };
    if (command.startsWith("/warn")) return { label, icon: PAGE_ICONS.warn, tint: tokens.warn };
    if (command.startsWith("/delete")) return { label: "Delete message", icon: PAGE_ICONS.purge, tint: tokens.text2 };
    const text = parsed.kind === "text" ? `${parsed.line1}${parsed.line2}` : "";
    return { label, text, tint: tokens.text2 };
}
