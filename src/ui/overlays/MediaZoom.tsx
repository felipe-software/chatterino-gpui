import { useState } from "react";
import { Image, View, useWindowDimensions } from "@felipe-software/react-native-gpui";
import { FloatingWindow } from "../common/FloatingWindow";
import { useApp } from "../state/AppContext";
import type { MediaZoomRequest } from "../state/overlays";
import { mediaWindowSize, mediaWindowTitle, nextZoom, zoomedSize } from "./mediaZoomLayout";

type Props = { request: MediaZoomRequest; onClose: () => void };

export function MediaZoom({ request, onClose }: Props) {
    const { theme } = useApp();
    const screen = useWindowDimensions();
    const [zoom, setZoom] = useState(1);
    const natural = request.imageWidth && request.imageHeight ? { width: request.imageWidth, height: request.imageHeight } : undefined;
    const base = mediaWindowSize(natural, screen);
    const size = zoomedSize(base, zoom);
    const background = theme.modern?.bgChat ?? theme.messages.background;
    return (
        <FloatingWindow
            testID="media-zoom"
            title={mediaWindowTitle(request.image)}
            width={size.width}
            height={size.height}
            x={Math.round(request.x - base.width / 2)}
            y={Math.round(request.y - base.height / 2)}
            frameless
            onClose={onClose}
            onBackdropPress={onClose}
        >
            <View
                testID="media-zoom-surface"
                style={{ flex: 1, backgroundColor: background }}
                onWheel={(event) => {
                    const deltaY = event.nativeEvent.deltaY;
                    if (deltaY === 0) return;
                    setZoom((current) => nextZoom(current, deltaY < 0 ? "in" : "out"));
                }}
            >
                <Image testID="media-zoom-image" source={{ uri: request.image }} resizeMode="contain" style={{ flex: 1 }} />
            </View>
        </FloatingWindow>
    );
}
