import type { ReactNode } from "react";
import { View, Window, type WindowPosition } from "@felipe-software/react-native-gpui";
import { DialogFrameContext } from "../modern/controls/DialogFrameContext";
import { DialogFrameHeader } from "../modern/controls/DialogFrameHeader";
import { MenuHost } from "../modern/controls/MenuHost";
import { useApp } from "../state/AppContext";
import { chromeColors } from "../theme";
import type { OverlayWindow } from "./overlayWindows";

type Props = {
    window: OverlayWindow;
    testID: string;
    title: string;
    width: number;
    height: number;
    x?: number;
    y?: number;
    frameless?: boolean;
    header?: ReactNode;
    onClose: () => void;
    onBackdropPress?: () => void;
    children: ReactNode;
};

const IN_WINDOW_TITLE_HEIGHT = 28;

function positionFor(window: OverlayWindow, x: number | undefined, y: number | undefined): WindowPosition {
    if (x === undefined || y === undefined) return "center";
    if (window.anchor) return { x: x - window.anchor.x, y: y - window.anchor.y, relativeTo: "cursor" };
    return { x, y, relativeTo: "parent" };
}

export function OverlayWindowFrame({ window, testID, title, width, height, x, y, frameless, header, onClose, onBackdropPress, children }: Props) {
    const { theme } = useApp();
    const colors = chromeColors(theme);
    const tokens = theme.modern;
    const closesOnBlur = window.closeOnBlur ?? (window.kind === "popup" && Boolean(onBackdropPress));
    const legacyHeight = frameless ? height : height - IN_WINDOW_TITLE_HEIGHT;
    const decorated = window.kind !== "popup";
    return (
        <Window
            testID={testID}
            title={title}
            kind={window.kind}
            width={width}
            height={tokens ? height : legacyHeight}
            position={positionFor(window, x, y)}
            closeOnEscape={window.closeOnEscape}
            closeOnBlur={closesOnBlur}
            onClose={onClose}
        >
            <>
                {tokens ? (
                    <DialogFrameContext.Provider value={{ decorated }}>
                        <View
                            testID={testID}
                            style={{ flex: 1, backgroundColor: tokens.bgRaised, borderWidth: decorated ? 0 : 1, borderColor: tokens.lineStrong }}
                        >
                            <MenuHost>
                                <DialogFrameHeader testID={testID} title={title} header={header} frameless={!!frameless} decorated={decorated} onClose={onClose} />
                                <View style={{ flex: 1 }}>{children}</View>
                            </MenuHost>
                        </View>
                    </DialogFrameContext.Provider>
                ) : (
                    <View
                        testID={testID}
                        style={{
                            flex: 1,
                            backgroundColor: frameless ? theme.window.background : colors.background,
                            borderWidth: frameless ? 1 : 0,
                            borderColor: colors.outline,
                        }}
                    >
                        {children}
                    </View>
                )}
            </>
        </Window>
    );
}
