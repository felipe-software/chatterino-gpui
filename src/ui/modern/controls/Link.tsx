import { useState } from "react";
import { Text } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "./useModernTokens";

type Props = { label: string; onPress: () => void; size?: 12 | 13; weight?: "400" | "500" | "600"; testID?: string };

export function Link({ label, onPress, size = 13, weight = "400", testID }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const [hovered, setHovered] = useState(false);
    return (
        <Text
            testID={testID}
            accessibilityRole="link"
            onPress={() => onPress()}
            style={{
                color: hovered ? tokens.accentHover : tokens.accent,
                fontFamily: fonts.uiFamily,
                fontSize: size,
                lineHeight: size + 5,
                fontWeight: weight,
                cursor: "pointer",
            }}
        >
            {label}
        </Text>
    );
}
