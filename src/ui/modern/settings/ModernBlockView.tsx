import type { SettingsAccess } from "../../settings/generalTypes";
import { AppearanceThemeCard } from "./AppearanceThemeCard";
import { BadgeToggleGrid } from "./BadgeToggleGrid";
import { EmoteProvidersTable } from "./EmoteProvidersTable";
import type { ModernBlock } from "./modernGeneralPages";
import { ModernItemRow } from "./ModernItemRow";
import { ModernLinksRow } from "./ModernLinksRow";
import type { ItemIndex } from "./modernRows";
import type { SectionFilter } from "./modernSearch";
import { SettingRowsCard } from "./SettingRowsCard";

type Props = { block: ModernBlock; blockId: string; filter: SectionFilter; items: ItemIndex; access: SettingsAccess };

export function ModernBlockView({ block, blockId, filter, items, access }: Props) {
    const blockVisible = filter.all || filter.keys.has(blockId);
    switch (block.kind) {
        case "rows": {
            const rows = block.rows.filter((row) => (filter.all || filter.keys.has(row.id)) && (row.kind === "links" || items.has(row.id)));
            if (rows.length === 0) return null;
            return (
                <SettingRowsCard>
                    {rows.map((row) => {
                        if (row.kind === "links") return <ModernLinksRow key={row.id} spec={row} items={items} access={access} />;
                        const item = items.get(row.id);
                        return item ? <ModernItemRow key={row.id} item={item} spec={row} access={access} /> : null;
                    })}
                </SettingRowsCard>
            );
        }
        case "theme":
            return blockVisible ? <AppearanceThemeCard block={block} items={items} access={access} /> : null;
        case "providers":
            return blockVisible ? <EmoteProvidersTable block={block} items={items} access={access} /> : null;
        case "badges":
            return blockVisible ? <BadgeToggleGrid block={block} items={items} access={access} /> : null;
    }
}
