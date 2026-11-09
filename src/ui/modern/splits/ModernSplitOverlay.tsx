import { useState } from "react";
import { View } from "@felipe-software/react-native-gpui";
import { withAlpha } from "../../colors";
import type { Direction } from "../../layout/tree";
import { useApp } from "../../state/AppContext";
import { overlayButtons, overlayPreview, type OverlayButtonKind } from "../../splits/overlayGeometry";
import { useSplitDrag } from "../../splits/useSplitDrag";
import { IconButton } from "../controls/IconButton";
import { useModernTokens } from "../controls/useModernTokens";
import { SPLIT_ICONS } from "./icons";

type Props = {
    splitId: string;
    tabId: string;
    width: number;
    height: number;
    onInsert: (direction: Direction) => void;
    onDragStart: () => void;
};

const TILE = 38;
const SCRIM_ALPHA = 0.72;

const LABELS: Record<OverlayButtonKind, string> = {
    move: "Move split",
    left: "Add split to the left",
    right: "Add split to the right",
    above: "Add split above",
    below: "Add split below",
};

export function ModernSplitOverlay({ splitId, tabId, width, height, onInsert, onDragStart }: Props) {
    const { theme } = useApp();
    const tokens = useModernTokens();
    const [hovered, setHovered] = useState<OverlayButtonKind | undefined>(undefined);
    const drag = useSplitDrag(splitId, tabId, 0, onDragStart);
    const preview = hovered ? overlayPreview(hovered, width, height) : undefined;
    return (
        <View
            testID={`split-overlay-${splitId}`}
            style={{ position: "absolute", left: 0, top: 0, width, height, backgroundColor: withAlpha(tokens.bgWindow, SCRIM_ALPHA), zIndex: 25 }}
            onMouseDown={() => undefined}
        >
            {preview ? (
                <View
                    testID={`split-overlay-preview-${splitId}`}
                    pointerEvents="none"
                    style={{
                        position: "absolute",
                        left: preview.x,
                        top: preview.y,
                        width: preview.width,
                        height: preview.height,
                        borderWidth: 1,
                        borderRadius: 6,
                        borderColor: theme.splits.dropPreviewBorder,
                        backgroundColor: theme.splits.dropPreview,
                    }}
                />
            ) : null}
            {overlayButtons(width, height, TILE, TILE).map((box) => {
                const isMove = box.kind === "move";
                const insert = () => onInsert(box.kind as Direction);
                return (
                    <View
                        key={box.kind}
                        style={{
                            position: "absolute",
                            left: box.rect.x,
                            top: box.rect.y,
                            width: TILE,
                            height: TILE,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: tokens.lineStrong,
                            backgroundColor: tokens.bgRaised,
                            boxShadow: tokens.shadow,
                        }}
                        onMouseEnter={() => setHovered(box.kind)}
                        onMouseLeave={() => setHovered(undefined)}
                        onMouseMove={isMove ? drag.move : undefined}
                        onMouseUp={isMove ? drag.end : undefined}
                    >
                        <IconButton
                            testID={`split-overlay-${box.kind}-${splitId}`}
                            icon={SPLIT_ICONS[box.kind]}
                            label={LABELS[box.kind]}
                            size={TILE - 4}
                            iconSize={18}
                            onMouseDown={isMove ? drag.begin : undefined}
                            onPress={isMove ? () => undefined : insert}
                        />
                    </View>
                );
            })}
        </View>
    );
}
