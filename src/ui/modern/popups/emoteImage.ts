import type { EmoteInfo } from "../../../data/api";

const EMOJI_SIZE = 28;
const FALLBACK_SIZE = 28;

export type ImageSize = { width: number; height: number };

export function emoteKey(emote: EmoteInfo): string {
    return `${emote.provider}:${emote.name}`;
}

export function fitEmote(emote: EmoteInfo, box: number): ImageSize {
    const isEmoji = emote.provider === "emoji";
    const width = isEmoji ? EMOJI_SIZE : emote.width || FALLBACK_SIZE;
    const height = isEmoji ? EMOJI_SIZE : emote.height || FALLBACK_SIZE;
    const scale = Math.min(1, box / width, box / height);
    return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
