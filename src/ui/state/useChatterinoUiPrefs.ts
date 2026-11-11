import { useEffect } from "react";
import type { Store } from "../../data/api";
import type { Core } from "./AppContext";
import type { UiPrefs } from "./prefs";
import { applyWindowGeometry } from "./windowGeometry";

export function useChatterinoUiPrefs(core: Core, prefsStore: Store<UiPrefs>): void {
    useEffect(
        () =>
            core.chatterino.onUiUpdate(({ prefs, mutedTabIds, window }) => {
                if (window) applyWindowGeometry(window);
                prefsStore.set((current) => {
                    const next: UiPrefs = { ...current, ...prefs };
                    if (mutedTabIds) next.mutedTabs = mutedTabIds;
                    return next;
                });
            }),
        [core, prefsStore],
    );
}
