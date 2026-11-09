import type { ReactNode } from "react";
import { View } from "@felipe-software/react-native-gpui";
import { Button } from "../controls/Button";
import { DialogFooter } from "../controls/DialogFooter";
import { useModernTokens } from "../controls/useModernTokens";
import { modernFooterHint, type ModernPageName } from "./modernSettingsPages";
import { SettingsNav } from "./SettingsNav";

type Props = {
    page: ModernPageName;
    visible: ModernPageName[];
    query: string;
    onQueryChange: (query: string) => void;
    onSelect: (page: ModernPageName) => void;
    onCancel: () => void;
    onSave: () => void;
    children: ReactNode;
};

export function ModernSettingsShell({ page, visible, query, onQueryChange, onSelect, onCancel, onSave, children }: Props) {
    const tokens = useModernTokens();
    const isAbout = page === "About";
    return (
        <View testID="settings-modern" style={{ flex: 1, backgroundColor: tokens.bgChat }}>
            <View style={{ flex: 1, minHeight: 0, flexDirection: "row" }}>
                <SettingsNav selected={page} visible={visible} query={query} onQueryChange={onQueryChange} onSelect={onSelect} />
                <View testID="settings-content" style={{ flex: 1, minWidth: 0 }}>
                    {children}
                </View>
            </View>
            {isAbout ? (
                <DialogFooter tone="window">
                    <Button testID="settings-ok" label="Close" onPress={onSave} />
                </DialogFooter>
            ) : (
                <DialogFooter tone="window" hint={modernFooterHint(page)}>
                    <Button testID="settings-cancel" label="Cancel" onPress={onCancel} />
                    <Button testID="settings-ok" label="Save" variant="primary" onPress={onSave} />
                </DialogFooter>
            )}
        </View>
    );
}
