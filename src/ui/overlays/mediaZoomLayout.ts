import type { ChatListPressEvent } from "../../native/chatList";
import type { MediaZoomRequest } from "../state/overlays";
import type { ZoomDirection } from "../zoom";

type Size = { width: number; height: number };

const MAX_UPSCALE = 2;
const FALLBACK_RATIO = 16 / 9;
const FALLBACK_WIDTH = 640;

function fittedImage(natural: Size | undefined, room: Size): Size {
    const known = !!natural && natural.width > 0 && natural.height > 0;
    if (!natural || !known) {
        const width = Math.min(room.width, room.height * FALLBACK_RATIO, FALLBACK_WIDTH);
        return { width: Math.round(width), height: Math.round(width / FALLBACK_RATIO) };
    }
    const scale = Math.min(room.width / natural.width, room.height / natural.height, MAX_UPSCALE);
    return { width: Math.round(natural.width * scale), height: Math.round(natural.height * scale) };
}

const WINDOW_SHARE = 0.85;

export function mediaWindowSize(natural: Size | undefined, screen: Size): Size {
    const room = { width: Math.max(1, Math.round(screen.width * WINDOW_SHARE)), height: Math.max(1, Math.round(screen.height * WINDOW_SHARE)) };
    return fittedImage(natural, room);
}

export function mediaWindowTitle(url: string): string {
    try {
        const parsed = new URL(url);
        const name = parsed.pathname.split("/").filter(Boolean).pop();
        return name ? `${decodeURIComponent(name)} - ${parsed.host}` : parsed.host;
    } catch {
        return url;
    }
}

const ZOOM_STEP = 1.15;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const MIN_SIDE = 80;

export function nextZoom(zoom: number, direction: ZoomDirection): number {
    if (direction === "reset") return 1;
    const next = direction === "in" ? zoom * ZOOM_STEP : zoom / ZOOM_STEP;
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
}

export function zoomedSize(base: Size, zoom: number): Size {
    const smallest = Math.min(base.width, base.height);
    const floor = smallest > 0 ? MIN_SIDE / smallest : 1;
    const scale = Math.max(zoom, Math.min(1, floor));
    return { width: Math.round(base.width * scale), height: Math.round(base.height * scale) };
}

export function mediaZoomFor(event: ChatListPressEvent): MediaZoomRequest | undefined {
    const isImageClick = event.button === "left" && event.preview === "image" && !!event.url;
    if (!isImageClick || !event.url) return undefined;
    return { image: event.url, imageWidth: event.imageWidth, imageHeight: event.imageHeight, x: event.x, y: event.y };
}
