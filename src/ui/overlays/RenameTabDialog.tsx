import { useState } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import { FloatingWindow } from "../common/FloatingWindow";
import { PushButton } from "../common/PushButton";
import { TextField } from "../common/TextField";
import { defaultTabTitle, tabById } from "../layout/tabs";
import { Button } from "../modern/controls/Button";
import { DialogFooter } from "../modern/controls/DialogFooter";
import { TextField as ModernTextField } from "../modern/controls/TextField";
import { useApp } from "../state/AppContext";
import { MENTIONS_CHANNEL } from "../state/ids";
import { useStore } from "../state/useStore";
import { chromeColors } from "../theme";

type Props = { tabId: string; onClose: () => void };

const MODERN_WIDTH = 380;
const MODERN_HEIGHT = 157;

export function RenameTabDialog({ tabId, onClose }: Props) {
    const { core, theme, fonts, actions, channelInfos } = useApp();
    const colors = chromeColors(theme);
    const tokens = theme.modern;
    const infos = useStore(channelInfos);
    const tab = tabById(core.layout.get(), tabId);
    const [name, setName] = useState(tab?.title ?? "");
    const displayName = (channel: string) => (channel === MENTIONS_CHANNEL ? "/mentions" : (infos[channel]?.displayName ?? channel));
    const placeholder = defaultTabTitle(tab?.root ?? null, displayName);
    const accept = () => {
        actions.renameTab(tabId, name);
        onClose();
    };
    if (tokens) {
        return (
            <FloatingWindow testID="rename-tab-dialog" title="Rename tab" width={MODERN_WIDTH} height={MODERN_HEIGHT} modal onClose={onClose}>
                <View style={{ flex: 1, gap: 6, paddingTop: 16, paddingHorizontal: 20 }}>
                    <Text style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18, fontWeight: "500" }}>Name</Text>
                    <ModernTextField testID="rename-tab-input" value={name} placeholder={placeholder} autoFocus onChange={setName} onSubmit={accept} />
                </View>
                <DialogFooter>
                    <Button testID="rename-tab-cancel" label="Cancel" onPress={onClose} />
                    <Button testID="rename-tab-ok" label="Rename" variant="primary" onPress={accept} />
                </DialogFooter>
            </FloatingWindow>
        );
    }
    return (
        <FloatingWindow testID="rename-tab-dialog" title="Rename Tab" width={340} height={130} modal onClose={onClose}>
            <View style={{ flex: 1, padding: 14, justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={{ color: colors.text, fontFamily: fonts.appFamily, fontSize: fonts.appSize }}>Name:</Text>
                    <TextField grow testID="rename-tab-input" value={name} placeholder={placeholder} autoFocus onChange={setName} onSubmit={accept} />
                </View>
                <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
                    <PushButton testID="rename-tab-cancel" label="Cancel" onPress={onClose} />
                    <PushButton testID="rename-tab-ok" label="OK" primary onPress={accept} />
                </View>
            </View>
        </FloatingWindow>
    );
}
