import type { ReactNode } from "react";
import { View } from "@felipe-software/react-native-gpui";
import { SettingsPageHeader } from "../settings/SettingsPageHeader";
import { useModernTokens } from "../controls/useModernTokens";

type Props = {
    title: string;
    description?: string;
    actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: Props) {
    const tokens = useModernTokens();
    if (!actions) return <SettingsPageHeader tokens={tokens} title={title} description={description} />;
    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", columnGap: 16, rowGap: 16 }}>
            <SettingsPageHeader tokens={tokens} title={title} description={description} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>{actions}</View>
        </View>
    );
}
