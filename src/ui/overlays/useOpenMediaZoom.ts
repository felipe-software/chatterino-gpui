import { useApp } from "../state/AppContext";
import type { MediaZoomRequest } from "../state/overlays";

export function useOpenMediaZoom(): (request: MediaZoomRequest) => void {
    const { openOverlay } = useApp();
    return (request) => openOverlay({ kind: "media", ...request });
}
