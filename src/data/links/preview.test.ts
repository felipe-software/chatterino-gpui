import { describe, expect, test } from "bun:test";
import type { FetchLike } from "../util/http";
import { linkPreview, youtubeVideoId } from "./preview";
import { PreviewTitles } from "./previewTitles";

describe("linkPreview", () => {
    test("previews image links with the file name and host", () => {
        expect(linkPreview("https://i.imgur.com/AbC123.PNG?x=1")).toEqual({
            kind: "image",
            link: "https://i.imgur.com/AbC123.PNG?x=1",
            image: "https://i.imgur.com/AbC123.PNG?x=1",
            badge: "PNG",
            name: "AbC123.PNG",
            domain: "i.imgur.com",
        });
        expect(linkPreview("http://www.example.com/a/b/cat%20pic.gif")?.name).toBe("cat pic.gif");
        expect(linkPreview("http://www.example.com/a/b/cat%20pic.gif")?.domain).toBe("example.com");
    });

    test("previews video links without an image", () => {
        const preview = linkPreview("http://f.feridinha.com/8gxpl.mp4");
        expect(preview).toEqual({
            kind: "video",
            link: "http://f.feridinha.com/8gxpl.mp4",
            video: "http://f.feridinha.com/8gxpl.mp4",
            badge: "MP4",
            name: "8gxpl.mp4",
            domain: "f.feridinha.com",
        });
    });

    test("previews YouTube links through the video thumbnail", () => {
        const preview = linkPreview("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42");
        expect(preview?.kind).toBe("youtube");
        expect(preview?.image).toBe("https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
        expect(preview?.badge).toBe("YouTube");
        expect(preview?.domain).toBe("youtube.com");
        expect(preview?.name).toBe("dQw4w9WgXcQ");
    });

    test("finds the video id in every YouTube link shape", () => {
        const id = "dQw4w9WgXcQ";
        for (const link of [
            `https://youtu.be/${id}?si=abc`,
            `https://m.youtube.com/watch?feature=share&v=${id}`,
            `https://youtube.com/shorts/${id}`,
            `https://www.youtube.com/live/${id}?feature=shared`,
            `https://www.youtube.com/embed/${id}`,
            `https://music.youtube.com/watch?v=${id}`,
        ]) {
            expect(youtubeVideoId(link)).toBe(id);
        }
        expect(youtubeVideoId("https://www.youtube.com/watch?v=short")).toBeUndefined();
        expect(youtubeVideoId("https://www.youtube.com/@channel")).toBeUndefined();
        expect(youtubeVideoId("https://notyoutube.com/watch?v=dQw4w9WgXcQ")).toBeUndefined();
    });

    test("skips links that are not media", () => {
        expect(linkPreview("https://example.com")).toBeUndefined();
        expect(linkPreview("https://example.com/page.html")).toBeUndefined();
        expect(linkPreview("https://example.com/png")).toBeUndefined();
        expect(linkPreview("chatterino://channel/forsen")).toBeUndefined();
    });
});

function jsonFetch(responses: Record<string, unknown>, calls: string[]): FetchLike {
    return async (url) => {
        calls.push(url);
        const body = responses[url];
        const ok = body !== undefined;
        return { ok, status: ok ? 200 : 404, text: async () => JSON.stringify(body ?? {}), json: async () => body };
    };
}

describe("PreviewTitles", () => {
    const id = "dQw4w9WgXcQ";
    const oembed = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`;

    test("loads a YouTube title once and caches it for every link shape", async () => {
        const calls: string[] = [];
        const titles = new PreviewTitles(jsonFetch({ [oembed]: { title: "  Never Gonna Give You Up  " } }, calls));
        expect(titles.cached(`https://youtu.be/${id}`)).toBeUndefined();
        const [first, second] = await Promise.all([titles.load(`https://youtu.be/${id}`), titles.load(`https://www.youtube.com/watch?v=${id}`)]);
        expect(first).toBe("Never Gonna Give You Up");
        expect(second).toBe("Never Gonna Give You Up");
        expect(titles.cached(`https://youtube.com/shorts/${id}`)).toBe("Never Gonna Give You Up");
        expect(calls).toEqual([oembed]);
    });

    test("remembers failures instead of asking again", async () => {
        const calls: string[] = [];
        const titles = new PreviewTitles(jsonFetch({}, calls));
        expect(await titles.load(`https://youtu.be/${id}`)).toBeUndefined();
        expect(await titles.load(`https://youtu.be/${id}`)).toBeUndefined();
        expect(calls.length).toBe(1);
        expect(await titles.load("https://example.com/cat.png")).toBeUndefined();
        expect(calls.length).toBe(1);
    });
});
