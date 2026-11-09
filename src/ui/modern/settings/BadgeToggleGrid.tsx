import { View } from "@felipe-software/react-native-gpui";
import type { SettingsAccess } from "../../settings/generalTypes";
import { Chip } from "../controls/Chip";
import type { ModernBlock } from "./modernGeneralPages";
import type { ItemIndex } from "./modernRows";

type Props = { block: Extract<ModernBlock, { kind: "badges" }>; items: ItemIndex; access: SettingsAccess };

const COLUMNS = 3;

function chunk<T>(list: T[], size: number): T[][] {
    const rows: T[][] = [];
    for (let index = 0; index < list.length; index += size) rows.push(list.slice(index, index + size));
    return rows;
}

export function BadgeToggleGrid({ block, items, access }: Props) {
    const rows = chunk(block.badges, COLUMNS);
    return (
        <View testID="settings-badges" style={{ gap: 8 }}>
            {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={{ flexDirection: "row", gap: 8 }}>
                    {row.map((badge) => {
                        const item = items.get(badge.id);
                        if (item?.kind !== "checkbox") return <View key={badge.id} style={{ flex: 1 }} />;
                        return (
                            <View key={badge.id} style={{ flex: 1, minWidth: 0 }}>
                                <Chip testID={`setting-${badge.id}`} size="lg" label={badge.label} selected={item.get(access)} onPress={() => item.set(access, !item.get(access))} />
                            </View>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}
