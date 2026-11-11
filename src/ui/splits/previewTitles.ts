import type { ChatCore } from "../../data/api";
import { withPreviewTitle } from "../../data/links/preview";
import type { ChatListMessagePatch, ChatListPreview } from "../../native/chatList";

type WithPreview = { id: string; preview?: ChatListPreview };

export type PreviewTitleSource = Pick<ChatCore, "previewTitle" | "loadPreviewTitle">;

export function titlePreviews<T extends WithPreview>(items: T[], source: PreviewTitleSource, onLoaded: (patch: ChatListMessagePatch) => void): T[] {
    return items.map((item) => {
        const preview = item.preview;
        if (preview?.kind !== "youtube") return item;
        const title = source.previewTitle(preview.link);
        if (title) return { ...item, preview: withPreviewTitle(preview, title) };
        void source.loadPreviewTitle(preview.link).then((loaded) => {
            if (loaded) onLoaded({ id: item.id, preview: withPreviewTitle(preview, loaded) });
        });
        return item;
    });
}
