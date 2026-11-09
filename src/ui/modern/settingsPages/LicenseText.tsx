import { ScrollView, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { Button } from "../controls/Button";
import { DialogFooter } from "../controls/DialogFooter";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { text: string; onClose: () => void };

export function LicenseText({ text, onClose }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
                <View style={{ paddingTop: 4, paddingHorizontal: 20, paddingBottom: 20 }}>
                    <Text style={{ color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 18 }}>{text}</Text>
                </View>
            </ScrollView>
            <DialogFooter>
                <Button testID="license-close" label="Close" onPress={onClose} />
            </DialogFooter>
        </View>
    );
}
