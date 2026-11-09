import { useMemo } from "react";
import { externalToolsItems, MODERN_EXTERNAL_TOOLS } from "../../settings/externalToolsOptions";
import { useSettingsUi } from "../../settings/SettingsContext";
import { useSettingsAccess } from "../../settings/useSettingsAccess";
import { useModernTokens } from "../controls/useModernTokens";
import { ModernBlockView } from "../settings/ModernBlockView";
import { indexItems } from "../settings/modernRows";
import { blockKey, filterSection } from "../settings/modernSearch";
import { SettingsSection } from "../settings/SettingsSection";
import { PageHeader } from "./PageHeader";
import { SettingsPageFrame } from "./SettingsPageFrame";
import { ToolSectionHeading } from "./ToolSectionHeading";

export function ModernExternalToolsPage() {
    const tokens = useModernTokens();
    const access = useSettingsAccess();
    const { query } = useSettingsUi();
    const items = useMemo(() => indexItems(externalToolsItems(access.canSpawn)), [access.canSpawn]);
    return (
        <SettingsPageFrame testID="settings-external" gap={32}>
            <PageHeader title="External tools" description="Players, uploaders and the spell checker." />
            {MODERN_EXTERNAL_TOOLS.map(({ section, links }) => {
                const filter = filterSection(section, items, query);
                if (!filter.show) return null;
                return (
                    <SettingsSection key={section.title} tokens={tokens}>
                        <ToolSectionHeading title={section.title} description={section.description} links={links} />
                        {section.blocks.map((block, index) => {
                            const key = blockKey(block, index);
                            return <ModernBlockView key={key} block={block} blockId={key} filter={filter} items={items} access={access} />;
                        })}
                    </SettingsSection>
                );
            })}
        </SettingsPageFrame>
    );
}
