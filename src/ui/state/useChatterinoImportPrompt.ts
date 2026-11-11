import { useEffect } from "react";
import type { ImportSummary } from "../../data/chatterino/bridge";
import type { Core } from "./AppContext";
import type { OverlaySpec } from "./overlays";

function plural(count: number, word: string): string {
    return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function importSummaryText(summary: ImportSummary): string {
    const parts = [plural(summary.accounts, "account"), plural(summary.tabs, "tab"), plural(summary.settings, "setting")];
    return `Imported ${parts.join(", ")} from Chatterino.`;
}

export function useChatterinoImportPrompt(core: Core, openOverlay: (spec: OverlaySpec) => string): void {
    useEffect(() => {
        if (core.settings.get().importFromChatterino !== undefined) return;
        let cancelled = false;
        const answer = (importFromChatterino: boolean) => core.settings.set((current) => ({ ...current, importFromChatterino }));
        void core.chatterino.find().then((instance) => {
            if (cancelled || !instance) return;
            openOverlay({
                kind: "confirm",
                title: "Import from Chatterino",
                message: "Chatterino is installed on this computer. Import its accounts, tabs, highlights and settings?",
                cancelLabel: "No",
                onCancel: () => answer(false),
                onConfirm: () => {
                    answer(true);
                    void core.chatterino.importAll(instance).then((summary) =>
                        openOverlay({ kind: "confirm", title: "Import from Chatterino", message: importSummaryText(summary), infoOnly: true, onConfirm: () => undefined }),
                    );
                },
            });
        });
        return () => {
            cancelled = true;
        };
    }, [core, openOverlay]);
}
