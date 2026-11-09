import { NativeClipboard, Platform, View, type RendererProvenance } from "@felipe-software/react-native-gpui";
import type { ContributorSection } from "../../settings/contributors";
import { useSettingsUi } from "../../settings/SettingsContext";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";
import { SettingsSection } from "../settings/SettingsSection";
import { AboutHeader } from "./AboutHeader";
import { AboutLinkCard } from "./AboutLinkCard";
import { AttributionList, type Attribution } from "./AttributionList";
import { LibraryList } from "./LibraryList";
import { LicenseText } from "./LicenseText";
import { PAGE_ICONS } from "./pageIcons";
import { PersonChip } from "./PersonChip";
import { SettingsPageFrame } from "./SettingsPageFrame";

export type LicensedProject = { name: string; url: string; license?: string; licenseUrl?: string };

type Props = {
    provenance: RendererProvenance | null;
    versionText: string;
    projects: LicensedProject[];
    attributions: Attribution[];
    people: ContributorSection[];
};

const VERSION = "2.5.5 (example)";
const SHORT_REVISION = 9;
const ANON_AVATAR = "avatars/anon.png";
const ROLES: Record<string, string> = { Maintainers: "Maintainer", Collaborators: "Collaborator", Contributors: "Contributor" };
const LINKS = [
    { id: "wiki", icon: PAGE_ICONS.book, title: "Wiki", description: "Guides and answers to common questions", url: "https://wiki.chatterino.com" },
    { id: "features", icon: PAGE_ICONS.sparkle, title: "Features", description: "Everything Chatterino can do", url: "https://chatterino.com/#features" },
    { id: "discord", icon: PAGE_ICONS.discord, title: "Discord", description: "Talk with the team and community", url: "https://discord.gg/7Y5AYhAK4z" },
];

function versionLine(provenance: RendererProvenance | null): string {
    if (!provenance) return `Version ${VERSION}`;
    return `Version ${VERSION} · gpui ${provenance.gpuiRevision.slice(0, SHORT_REVISION)}`;
}

function detailsLine(provenance: RendererProvenance | null): string {
    if (!provenance) return `Running on ${Platform.OS}`;
    const engine = provenance.jsEngineVersion === "system" ? `system ${provenance.jsEngine}` : `${provenance.jsEngine} ${provenance.jsEngineVersion}`;
    return `${provenance.renderer} ${provenance.rendererVersion} · ${engine} · ${Platform.OS}`;
}

export function ModernAboutPage({ provenance, versionText, projects, attributions, people }: Props) {
    const { openUrl } = useApp();
    const tokens = useModernTokens();
    const ui = useSettingsUi();

    const showLicense = (project: LicensedProject) => {
        const text = project.license;
        if (!text) {
            openUrl(project.licenseUrl ?? project.url);
            return;
        }
        ui.openPopup({
            kind: "modal",
            title: `License for ${project.name}`,
            width: 560,
            height: 420,
            render: (close) => <LicenseText text={text} onClose={close} />,
        });
    };

    return (
        <SettingsPageFrame testID="settings-about" gap={32}>
            <AboutHeader version={versionLine(provenance)} details={detailsLine(provenance)} onCopy={() => NativeClipboard.setString(versionText)} />
            <View style={{ flexDirection: "row", gap: 10 }}>
                {LINKS.map((link) => (
                    <AboutLinkCard
                        key={link.id}
                        testID={`about-${link.id}`}
                        icon={link.icon}
                        title={link.title}
                        description={link.description}
                        onPress={() => openUrl(link.url)}
                    />
                ))}
            </View>
            <SettingsSection tokens={tokens} title="People">
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                    {people.flatMap((section) =>
                        section.people.map((person) => (
                            <PersonChip
                                key={`${section.title}-${person.name}`}
                                testID={`about-person-${person.name}`}
                                name={person.name}
                                role={ROLES[section.title] ?? section.title}
                                avatar={person.avatar.endsWith(ANON_AVATAR) ? undefined : person.avatar}
                                onPress={() => openUrl(person.url)}
                            />
                        )),
                    )}
                </View>
            </SettingsSection>
            <SettingsSection tokens={tokens} title="Open source software">
                <LibraryList libraries={projects.map((project) => ({ name: project.name, url: project.url, onLicense: () => showLicense(project) }))} />
            </SettingsSection>
            <SettingsSection tokens={tokens} title="Attributions">
                <AttributionList attributions={attributions} />
            </SettingsSection>
        </SettingsPageFrame>
    );
}
