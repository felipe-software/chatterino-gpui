import type { ReactNode } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { Checkbox } from "../controls/Checkbox";
import { useModernTokens } from "../controls/useModernTokens";

type Props = {
    testID: string;
    value: boolean | undefined;
    onChange: (value: boolean) => void;
    children?: ReactNode;
};

export function FlagCell({ testID, value, onChange, children }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    if (value === undefined) {
        return (
            <Text accessibilityLabel="Not available" style={{ color: tokens.lineHover, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 }}>
                —
            </Text>
        );
    }
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Checkbox testID={testID} checked={value} onChange={onChange} />
            {children}
        </View>
    );
}
