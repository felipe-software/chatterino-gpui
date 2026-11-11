import { Text, View } from "@felipe-software/react-native-gpui";
import type { TimeoutButton } from "../../../data/api";
import { useApp } from "../../state/AppContext";
import { Button } from "../controls/Button";
import { useModernTokens } from "../controls/useModernTokens";
import { TimeoutCell } from "./TimeoutCell";
import { timeoutLabel, timeoutSeconds } from "./userCardData";

type Props = { buttons: TimeoutButton[]; onTimeout: (seconds: number) => void; onBan: () => void };

const HEIGHT = 28;

export function TimeoutBar({ buttons, onTimeout, onBan }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
                testID="user-card-timeouts"
                style={{
                    flex: 1,
                    minWidth: 0,
                    height: HEIGHT,
                    flexDirection: "row",
                    borderWidth: 1,
                    borderColor: tokens.lineStrong,
                    borderRadius: 6,
                    backgroundColor: tokens.bgInput,
                    overflow: "hidden",
                }}
            >
                <View style={{ justifyContent: "center", paddingHorizontal: 8 }}>
                    <Text numberOfLines={1} style={{ color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16, fontWeight: "500" }}>
                        Timeout
                    </Text>
                </View>
                {buttons.map((button) => {
                    const label = timeoutLabel(button);
                    return <TimeoutCell key={label} testID={`user-card-timeout-${label}`} label={label} onPress={() => onTimeout(timeoutSeconds(button))} />;
                })}
            </View>
            <Button testID="user-card-ban" label="Ban" size="sm" variant="danger" onPress={onBan} />
        </View>
    );
}
