import { Text, View } from "@felipe-software/react-native-gpui";
import { FloatingWindow } from "../common/FloatingWindow";
import { PushButton } from "../common/PushButton";
import { Button } from "../modern/controls/Button";
import { DialogFooter } from "../modern/controls/DialogFooter";
import { useApp } from "../state/AppContext";
import { chromeColors } from "../theme";

type Props = { title: string; message: string; infoOnly?: boolean; onConfirm: () => void; onClose: () => void };

const MODERN_WIDTH = 400;
const MODERN_PADDING = 20;
const MODERN_LINE_HEIGHT = 20;
const MODERN_CHAR_WIDTH = 7.4;
const MODERN_FOOTER_HEIGHT = 57;

function modernHeight(message: string): number {
    const charsPerLine = Math.floor((MODERN_WIDTH - MODERN_PADDING * 2) / MODERN_CHAR_WIDTH);
    const lines = message.split("\n").reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / charsPerLine)), 0);
    return MODERN_PADDING * 2 + lines * MODERN_LINE_HEIGHT + MODERN_FOOTER_HEIGHT;
}

export function ConfirmDialog({ title, message, infoOnly, onConfirm, onClose }: Props) {
    const { theme, fonts } = useApp();
    const colors = chromeColors(theme);
    const tokens = theme.modern;
    const confirm = () => {
        onClose();
        onConfirm();
    };
    if (tokens) {
        return (
            <FloatingWindow testID="confirm-dialog" title={title} width={MODERN_WIDTH} height={modernHeight(message)} modal onClose={onClose}>
                <View style={{ flex: 1, padding: MODERN_PADDING }}>
                    <Text style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 14, lineHeight: MODERN_LINE_HEIGHT }}>{message}</Text>
                </View>
                <DialogFooter>
                    {infoOnly ? null : <Button testID="confirm-cancel" label="Cancel" onPress={onClose} />}
                    <Button testID="confirm-ok" label={infoOnly ? "OK" : "Yes"} variant="primary" onPress={confirm} />
                </DialogFooter>
            </FloatingWindow>
        );
    }
    return (
        <FloatingWindow testID="confirm-dialog" title={title} width={380} height={150} modal onClose={onClose}>
            <View style={{ flex: 1, padding: 16, justifyContent: "space-between" }}>
                <Text style={{ color: colors.text, fontFamily: fonts.appFamily, fontSize: fonts.appSize }}>{message}</Text>
                <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
                    {infoOnly ? null : <PushButton testID="confirm-cancel" label="Cancel" onPress={onClose} />}
                    <PushButton testID="confirm-ok" label={infoOnly ? "OK" : "Yes"} primary onPress={confirm} />
                </View>
            </View>
        </FloatingWindow>
    );
}
