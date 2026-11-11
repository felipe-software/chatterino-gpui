import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { HoverLayer } from "../controls/HoverLayer";
import { useModernTokens } from "../controls/useModernTokens";
import { usePressState } from "../controls/usePressState";

type Props = { testID: string; label: string; onPress: () => void };

export function TimeoutCell({ testID, label, onPress }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const press = usePressState();
    return (
        <View
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={`Timeout for ${label}`}
            style={{ flex: 1, minWidth: 0, alignItems: "center", justifyContent: "center", borderLeftWidth: 1, borderLeftColor: tokens.lineStrong, cursor: "pointer" }}
            {...press.handlers}
            onClick={onPress}
        >
            <HoverLayer hovered={press.hovered} pressed={press.pressed} radius={0} />
            <Text numberOfLines={1} style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16, fontWeight: "600" }}>
                {label}
            </Text>
        </View>
    );
}
