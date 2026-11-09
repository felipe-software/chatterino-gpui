import type { SettingsAccess } from "../../settings/generalTypes";
import { Button } from "../controls/Button";
import type { ModernLinksRowSpec } from "./modernGeneralPages";
import type { ItemIndex } from "./modernRows";
import { SettingRow } from "./SettingRow";

type Props = { spec: ModernLinksRowSpec; items: ItemIndex; access: SettingsAccess };

function linkUrl(items: ItemIndex, id: string): string | undefined {
    const item = items.get(id);
    if (item?.kind !== "description") return undefined;
    return item.links?.[0]?.url;
}

export function ModernLinksRow({ spec, items, access }: Props) {
    return (
        <SettingRow label={spec.label} hint={spec.hint} testID={`setting-row-${spec.id}`}>
            {spec.links.map((link) => {
                const url = linkUrl(items, link.from);
                return (
                    <Button
                        key={link.from}
                        testID={`setting-${spec.id}-${link.label.toLowerCase()}`}
                        label={link.label}
                        disabled={!url}
                        onPress={() => {
                            if (url) access.openUrl(url);
                        }}
                    />
                );
            })}
        </SettingRow>
    );
}
