import { useState } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { Avatar } from "../controls/Avatar";
import { FadeLayer } from "../controls/FadeLayer";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { testID: string; name: string; role: string; avatar?: string; onPress: () => void };

export function PersonChip({ testID, name, role, avatar, onPress }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const [hovered, setHovered] = useState(false);
    return (
        <View
            testID={testID}
            accessibilityRole="link"
            accessibilityLabel={name}
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingVertical: 10,
                paddingLeft: 10,
                paddingRight: 16,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: tokens.lineSubtle,
                backgroundColor: tokens.bgRaised,
                cursor: "pointer",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onPress}
        >
            <FadeLayer visible={hovered} color={tokens.bgHover} borderColor={tokens.lineStrong} borderWidth={1} outset={1} radius={10} />
            <Avatar name={name} uri={avatar} size={32} borderWidth={0} />
            <View>
                <Text style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 14, lineHeight: 18, fontWeight: "600" }}>{name}</Text>
                <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>{role}</Text>
            </View>
        </View>
    );
}
