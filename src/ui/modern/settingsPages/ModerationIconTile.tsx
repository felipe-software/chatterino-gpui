import { Image, Svg, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";
import type { ActionLook } from "./moderationActionLook";

type Props = { testID: string; look: ActionLook; onPress: () => void };

export function ModerationIconTile({ testID, look, onPress }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    return (
        <View
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel="Change icon"
            style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: tokens.bgInput,
                cursor: "pointer",
            }}
            onClick={onPress}
        >
            {look.image ? <Image source={{ uri: look.image }} style={{ width: 16, height: 16 }} /> : null}
            {look.icon ? <Svg name={look.icon} style={{ width: 16, height: 16, color: look.tint }} /> : null}
            {look.text ? (
                <Text numberOfLines={1} style={{ color: look.tint, fontFamily: fonts.uiFamily, fontSize: 10, lineHeight: 12, fontWeight: "600" }}>
                    {look.text}
                </Text>
            ) : null}
        </View>
    );
}
