import { Svg, View } from "@felipe-software/react-native-gpui";
import { useModernTokens } from "../controls/useModernTokens";
import { PAGE_ICONS } from "./pageIcons";
import type { CellState } from "./tableModel";

type Props = { state: CellState; testID?: string };

export function DragHandle({ state, testID }: Props) {
    const tokens = useModernTokens();
    const enabled = !!state.drag;
    const restColor = state.hovered ? tokens.text3 : tokens.lineHover;
    const color = state.dragging ? tokens.accent : restColor;
    if (!enabled) return <View style={{ width: 16, height: 16 }} />;
    return (
        <View
            testID={testID}
            accessibilityLabel="Drag to reorder"
            nativePressDrag={false}
            style={{ width: 20, height: 28, justifyContent: "center", cursor: state.dragging ? "grabbing" : "grab" }}
            onMouseDown={state.drag?.onMouseDown}
            onMouseMove={state.drag?.onMouseMove}
            onMouseUp={state.drag?.onMouseUp}
        >
            <Svg name={PAGE_ICONS.grip} style={{ width: 16, height: 16, color }} />
        </View>
    );
}
