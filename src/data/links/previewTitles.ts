import { requestJson, type FetchLike } from "../util/http";
import { youtubeVideoId } from "./preview";

const OEMBED_URL = "https://www.youtube.com/oembed?format=json&url=";
const MAX_REMEMBERED = 500;
const TIMEOUT_MS = 10_000;

function remember<T>(map: Map<string, T>, key: string, value: T): void {
    if (map.size >= MAX_REMEMBERED) {
        const oldest = map.keys().next().value;
        if (oldest !== undefined) map.delete(oldest);
    }
    map.set(key, value);
}

export class PreviewTitles {
    private readonly titles = new Map<string, string>();
    private readonly failed = new Map<string, true>();
    private readonly pending = new Map<string, Promise<string | undefined>>();

    constructor(private readonly fetchFn: FetchLike) {}

    cached(link: string): string | undefined {
        const id = youtubeVideoId(link);
        return id ? this.titles.get(id) : undefined;
    }

    load(link: string): Promise<string | undefined> {
        const id = youtubeVideoId(link);
        if (!id || this.failed.has(id)) return Promise.resolve(undefined);
        const known = this.titles.get(id);
        if (known) return Promise.resolve(known);
        const pending = this.pending.get(id);
        if (pending) return pending;
        const request = this.request(id).finally(() => this.pending.delete(id));
        this.pending.set(id, request);
        return request;
    }

    private async request(id: string): Promise<string | undefined> {
        const watchUrl = `https://www.youtube.com/watch?v=${id}`;
        const url = `${OEMBED_URL}${encodeURIComponent(watchUrl)}`;
        try {
            const body = await requestJson<{ title?: unknown }>(this.fetchFn, url, { cache: "force-cache", timeoutMs: TIMEOUT_MS });
            const title = typeof body.title === "string" ? body.title.trim() : "";
            if (!title) {
                remember(this.failed, id, true);
                return undefined;
            }
            remember(this.titles, id, title);
            return title;
        } catch {
            remember(this.failed, id, true);
            return undefined;
        }
    }
}
