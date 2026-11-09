import { Svg, Text, View } from "@felipe-software/react-native-gpui";
import type { FilterCheck } from "../../../data/api";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";
import { PAGE_ICONS } from "./pageIcons";

type Props = { testID: string; check: FilterCheck; onShowErrors?: () => void };

export function FilterStatus({ testID, check, onShowErrors }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const color = check.valid ? tokens.success : tokens.mention;
    const label = check.valid ? "Valid" : check.detail.split("\n")[0];
    const pressable = !check.valid && !!onShowErrors;
    return (
        <View
            testID={testID}
            accessibilityRole={pressable ? "button" : "text"}
            style={{ flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", cursor: pressable ? "pointer" : "default" }}
            onClick={pressable ? onShowErrors : undefined}
        >
            <Svg name={check.valid ? PAGE_ICONS.valid : PAGE_ICONS.alert} style={{ width: 13, height: 13, color }} />
            <Text numberOfLines={1} style={{ flexShrink: 1, minWidth: 0, color, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>
                {label}
            </Text>
        </View>
    );
}
