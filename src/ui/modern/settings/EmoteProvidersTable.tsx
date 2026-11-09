import { Fragment } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import type { SettingsAccess } from "../../settings/generalTypes";
import { useApp } from "../../state/AppContext";
import { Divider } from "../controls/Divider";
import { useModernTokens } from "../controls/useModernTokens";
import type { ModernBlock } from "./modernGeneralPages";
import type { ItemIndex } from "./modernRows";
import { ProviderCell } from "./ProviderCell";
import { SettingsCard } from "./SettingsCard";

type Props = { block: Extract<ModernBlock, { kind: "providers" }>; items: ItemIndex; access: SettingsAccess };

const NAME_COLUMN = 1.4;

export function EmoteProvidersTable({ block, items, access }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const heading = { color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16, fontWeight: "500" as const };
    return (
        <SettingsCard tokens={tokens}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 16 }}>
                <Text numberOfLines={1} style={{ ...heading, flex: NAME_COLUMN, minWidth: 0 }}>
                    Provider
                </Text>
                {block.columns.map((column) => (
                    <Text key={column} numberOfLines={1} style={{ ...heading, flex: 1, minWidth: 0 }}>
                        {column}
                    </Text>
                ))}
            </View>
            {block.providers.map((provider) => (
                <Fragment key={provider.name}>
                    <Divider />
                    <View testID={`settings-provider-${provider.name}`} style={{ flexDirection: "row", alignItems: "center", gap: 8, minHeight: 48, paddingHorizontal: 16 }}>
                        <Text numberOfLines={1} style={{ flex: NAME_COLUMN, minWidth: 0, color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 14, lineHeight: 20, fontWeight: "500" }}>
                            {provider.name}
                        </Text>
                        {provider.cells.map((cell, index) => (
                            <ProviderCell
                                key={`${provider.name}-${index}`}
                                item={cell ? items.get(cell) : undefined}
                                label={`${provider.name} ${(block.columns[index] ?? "").toLowerCase()}`}
                                access={access}
                            />
                        ))}
                    </View>
                </Fragment>
            ))}
        </SettingsCard>
    );
}
