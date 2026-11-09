import { View } from "@felipe-software/react-native-gpui";
import type { MenuEntry } from "../state/overlays";
import { MenuPanel } from "./MenuPanel";

type Props = { entries: MenuEntry[]; x: number; y: number; alignRight?: boolean; minWidth?: number; onClose: () => void };

export function PopupMenu({ entries, x, y, alignRight, minWidth, onClose }: Props) {
    return (
        <View style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}>
            <View testID="popup-menu-backdrop" style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }} onMouseDown={onClose} />
            <MenuPanel entries={entries} x={x} y={y} alignRight={alignRight} minWidth={minWidth} path="" onDone={onClose} />
        </View>
    );
}
