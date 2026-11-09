import { View } from "@felipe-software/react-native-gpui";
import { UnderlineTab } from "./UnderlineTab";
import { useModernTokens } from "./useModernTokens";

export type TabItem<T extends string> = { value: T; label: string; badge?: string };

type Props<T extends string> = {
    tabs: Array<TabItem<T>>;
    value: T;
    onChange: (value: T) => void;
    height?: number;
    inset?: number;
    testID?: string;
};

export function Tabs<T extends string>({ tabs, value, onChange, height = 38, inset = 0, testID }: Props<T>) {
    const tokens = useModernTokens();
    return (
        <View
            testID={testID}
            accessibilityRole="tablist"
            style={{ flexDirection: "row", gap: 22, paddingHorizontal: inset }}
        >
            <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1, backgroundColor: tokens.lineSubtle }} />
            {tabs.map((tab) => (
                <UnderlineTab
                    key={tab.value}
                    testID={testID ? `${testID}-${tab.value}` : undefined}
                    label={tab.label}
                    badge={tab.badge}
                    selected={tab.value === value}
                    height={height}
                    onPress={() => onChange(tab.value)}
                />
            ))}
        </View>
    );
}
