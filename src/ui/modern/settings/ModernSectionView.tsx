import type { SettingsAccess } from "../../settings/generalTypes";
import { useModernTokens } from "../controls/useModernTokens";
import { ModernBlockView } from "./ModernBlockView";
import type { ModernSection } from "./modernGeneralPages";
import type { ItemIndex } from "./modernRows";
import { blockKey, type SectionFilter } from "./modernSearch";
import { SettingsSection } from "./SettingsSection";
import { SettingsSectionHeading } from "./SettingsSectionHeading";

type Props = { section: ModernSection; filter: SectionFilter | undefined; items: ItemIndex; access: SettingsAccess };

export function ModernSectionView({ section, filter, items, access }: Props) {
    const tokens = useModernTokens();
    if (!filter?.show) return null;
    return (
        <SettingsSection tokens={tokens}>
            <SettingsSectionHeading title={section.title} description={section.description} links={section.links} />
            {section.blocks.map((block, index) => {
                const key = blockKey(block, index);
                return <ModernBlockView key={key} block={block} blockId={key} filter={filter} items={items} access={access} />;
            })}
        </SettingsSection>
    );
}
