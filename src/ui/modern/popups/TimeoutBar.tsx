import { Text, View } from "@felipe-software/react-native-gpui";
import type { TimeoutButton } from "../../../data/api";
import { useApp } from "../../state/AppContext";
import { Button } from "../controls/Button";
import { useModernTokens } from "../controls/useModernTokens";
import { timeoutLabel, timeoutSeconds } from "./userCardData";

type Props = { buttons: TimeoutButton[]; onTimeout: (seconds: number) => void; onBan: () => void };

export function TimeoutBar({ buttons, onTimeout, onBan }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    return (
        <View style={{ gap: 8, paddingVertical: 14, paddingHorizontal: 18, borderTopWidth: 1, borderTopColor: tokens.lineSubtle }}>
            <Text style={{ color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16, fontWeight: "600" }}>Timeout</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
                {buttons.map((button) => {
                    const label = timeoutLabel(button);
                    return <Button key={label} testID={`user-card-timeout-${label}`} label={label} size="sm" onPress={() => onTimeout(timeoutSeconds(button))} />;
                })}
                <View style={{ flexGrow: 1 }} />
                <Button testID="user-card-ban" label="Ban" size="sm" variant="danger" onPress={onBan} />
            </View>
        </View>
    );
}
