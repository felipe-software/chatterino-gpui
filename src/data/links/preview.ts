import type { ChatListPreview } from "../../native/chatList";

const IMAGE_BADGES: Record<string, string> = { png: "PNG", jpg: "JPG", jpeg: "JPG", gif: "GIF", webp: "WEBP" };
const VIDEO_BADGES: Record<string, string> = { mp4: "MP4", webm: "WEBM", mov: "MOV", m4v: "M4V", mkv: "MKV" };
const YOUTUBE_HOSTS = new Set(["youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com"]);
const YOUTUBE_PATH_PREFIXES = ["shorts", "live", "embed", "v"];
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_DOMAIN = "youtube.com";

type SplitUrl = { host: string; path: string; query: string };

function splitUrl(link: string): SplitUrl | undefined {
    const match = /^https?:\/\/([^/?#]+)([^?#]*)(\?[^#]*)?/i.exec(link);
    if (!match) return undefined;
    const host = match[1].replace(/:\d+$/, "").replace(/^www\./i, "").toLowerCase();
    return { host, path: match[2] ?? "", query: match[3] ?? "" };
}

function queryParam(query: string, name: string): string | undefined {
    for (const pair of query.replace(/^\?/, "").split("&")) {
        const [key, value] = pair.split("=");
        if (key === name) return value;
    }
    return undefined;
}

function pathSegments(path: string): string[] {
    return path.split("/").filter((segment) => segment.length > 0);
}

function decodeSegment(segment: string): string {
    try {
        return decodeURIComponent(segment);
    } catch {
        return segment;
    }
}

export function youtubeVideoId(link: string): string | undefined {
    const url = splitUrl(link);
    if (!url) return undefined;
    const segments = pathSegments(url.path);
    let id: string | undefined;
    if (url.host === "youtu.be") id = segments[0];
    else if (YOUTUBE_HOSTS.has(url.host)) {
        if (segments[0] === "watch") id = queryParam(url.query, "v");
        else if (YOUTUBE_PATH_PREFIXES.includes(segments[0] ?? "")) id = segments[1];
    }
    return id && YOUTUBE_ID.test(id) ? id : undefined;
}

export function youtubeThumbnail(id: string): string {
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function fileExtension(name: string): string {
    const dot = name.lastIndexOf(".");
    return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

export function linkPreview(link: string): ChatListPreview | undefined {
    const url = splitUrl(link);
    if (!url) return undefined;
    const videoId = youtubeVideoId(link);
    if (videoId) {
        return { kind: "youtube", link, image: youtubeThumbnail(videoId), badge: "YouTube", name: videoId, domain: YOUTUBE_DOMAIN };
    }
    const segments = pathSegments(url.path);
    const last = segments[segments.length - 1];
    if (!last) return undefined;
    const name = decodeSegment(last);
    const extension = fileExtension(name);
    const imageBadge = IMAGE_BADGES[extension];
    if (imageBadge) return { kind: "image", link, image: link, badge: imageBadge, name, domain: url.host };
    const videoBadge = VIDEO_BADGES[extension];
    if (videoBadge) return { kind: "video", link, video: link, badge: videoBadge, name, domain: url.host };
    return undefined;
}

export function withPreviewTitle(preview: ChatListPreview, title: string | undefined): ChatListPreview {
    if (!title || preview.name === title) return preview;
    return { ...preview, name: title };
}
