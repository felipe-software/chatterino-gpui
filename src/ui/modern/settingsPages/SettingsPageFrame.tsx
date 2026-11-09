import type { ReactNode } from "react";
import { ScrollView, View } from "@felipe-software/react-native-gpui";

type Props = {
    testID: string;
    gap: number;
    maxWidth?: number;
    children: ReactNode;
};

export const PAGE_MAX_WIDTH = 720;

export function SettingsPageFrame({ testID, gap, maxWidth = PAGE_MAX_WIDTH, children }: Props) {
    return (
        <ScrollView testID={testID} style={{ flex: 1 }}>
            <View style={{ maxWidth, paddingTop: 28, paddingHorizontal: 40, paddingBottom: 48, gap }}>{children}</View>
        </ScrollView>
    );
}
