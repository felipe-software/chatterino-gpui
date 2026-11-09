import type { ReactNode } from "react";
import { Text, View, type MouseResponderEvent } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { MODERN_ICONS } from "../icons";
import { useDialogFrame } from "./DialogFrameContext";
import { IconButton } from "./IconButton";
import { useModernTokens } from "./useModernTokens";

type Props = {
    title?: string;
    onClose: () => void;
    children?: ReactNode;
    showClose?: boolean;
    closeTestID?: string;
    onMouseDown?: (event: MouseResponderEvent) => void;
    onMouseMove?: (event: MouseResponderEvent) => void;
    onMouseUp?: (event: MouseResponderEvent) => void;
};

export const DIALOG_HEADER_HEIGHT = 56;

export function DialogHeader({ title, onClose, children, showClose, closeTestID, onMouseDown, onMouseMove, onMouseUp }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const frame = useDialogFrame();
    const closable = showClose ?? !frame.decorated;
    const custom = children !== undefined && children !== null;
    const close = closable ? <IconButton testID={closeTestID} icon={MODERN_ICONS.close} label="Close" iconSize={16} onPress={() => onClose()} /> : null;
    const drag = { onMouseDown, onMouseMove, onMouseUp };
    if (custom) {
        return (
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6, paddingTop: 10, paddingRight: closable ? 6 : 10, paddingLeft: 10 }} {...drag}>
                <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
                {close ? <View style={{ marginTop: 2 }}>{close}</View> : null}
            </View>
        );
    }
    return (
        <View
            style={{
                height: DIALOG_HEADER_HEIGHT,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                paddingTop: 14,
                paddingBottom: 10,
                paddingRight: closable ? 10 : 18,
                paddingLeft: 18,
            }}
            {...drag}
        >
            <Text numberOfLines={1} style={{ flex: 1, color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 16, lineHeight: 22, fontWeight: "600" }}>
                {title ?? ""}
            </Text>
            {close}
        </View>
    );
}
