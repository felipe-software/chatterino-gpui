import { describe, expect, test } from "bun:test";
import type { ChatListPressEvent } from "../../native/chatList";
import { mediaWindowSize, mediaWindowTitle, mediaZoomFor, nextZoom, zoomedSize } from "./mediaZoomLayout";

const WINDOW = { width: 1000, height: 800 };

function press(extra: Partial<ChatListPressEvent>): ChatListPressEvent {
    return { target: "link", messageId: "m", button: "left", x: 300, y: 200, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false, ...extra };
}

describe("mediaWindowSize", () => {
    test("fits large images into 85% of the screen", () => {
        expect(mediaWindowSize({ width: 4000, height: 2000 }, WINDOW)).toEqual({ width: 850, height: 425 });
    });

    test("doubles small images at most", () => {
        expect(mediaWindowSize({ width: 64, height: 64 }, WINDOW)).toEqual({ width: 128, height: 128 });
    });

    test("falls back to a 16:9 frame before the image size is known", () => {
        expect(mediaWindowSize(undefined, WINDOW)).toEqual({ width: 640, height: 360 });
    });
});

describe("mediaWindowTitle", () => {
    test("names the window after the file and host", () => {
        expect(mediaWindowTitle("https://i.imgur.com/a%20b.png")).toBe("a b.png - i.imgur.com");
        expect(mediaWindowTitle("https://example.com/")).toBe("example.com");
    });
});

describe("wheel zoom", () => {
    test("each notch grows or shrinks by 15% within 0.25x and 4x", () => {
        expect(nextZoom(1, "in")).toBeCloseTo(1.15);
        expect(nextZoom(1, "out")).toBeCloseTo(1 / 1.15);
        expect(nextZoom(3.9, "in")).toBe(4);
        expect(nextZoom(0.26, "out")).toBe(0.25);
    });

    test("the window never shrinks below 80px on its short side", () => {
        expect(zoomedSize({ width: 400, height: 200 }, 2)).toEqual({ width: 800, height: 400 });
        expect(zoomedSize({ width: 400, height: 200 }, 0.25)).toEqual({ width: 160, height: 80 });
        expect(zoomedSize({ width: 64, height: 64 }, 0.5)).toEqual({ width: 64, height: 64 });
    });
});

describe("mediaZoomFor", () => {
    test("zooms a left click on an image preview at the click point", () => {
        const event = press({ preview: "image", url: "https://i.imgur.com/a.png", imageWidth: 600, imageHeight: 400 });
        expect(mediaZoomFor(event)).toEqual({ image: "https://i.imgur.com/a.png", imageWidth: 600, imageHeight: 400, x: 300, y: 200 });
    });

    test("leaves videos, plain links and other buttons to the link handler", () => {
        expect(mediaZoomFor(press({ preview: "video", url: "https://x.com/v.mp4" }))).toBeUndefined();
        expect(mediaZoomFor(press({ url: "https://x.com/a.png" }))).toBeUndefined();
        expect(mediaZoomFor(press({ preview: "image", url: "https://x.com/a.png", button: "middle" }))).toBeUndefined();
    });
});
