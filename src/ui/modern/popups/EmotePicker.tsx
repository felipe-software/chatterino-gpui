import { useCallback, useMemo, useState } from "react";
import { View } from "@felipe-software/react-native-gpui";
import type { EmoteInfo } from "../../../data/api";
import { EMOTE_TAB_LABELS, EMOTE_TABS, emoteSourceLabel, type EmoteListView, type EmoteTab } from "../../overlays/emoteSections";
import { EmptyState } from "../controls/EmptyState";
import { Tabs } from "../controls/Tabs";
import { useModernTokens } from "../controls/useModernTokens";
import { emoteKey } from "./emoteImage";
import { EmoteGroupSwitch } from "./EmoteGroupSwitch";
import { EmotePreview } from "./EmotePreview";
import { EmoteTileGrid } from "./EmoteTileGrid";

type Props = {
    tab: EmoteTab;
    searching: boolean;
    view: EmoteListView;
    gridKey: string;
    grouped: boolean;
    canGroup: boolean;
    nameOf: (emote: EmoteInfo) => string;
    onTab: (tab: EmoteTab) => void;
    onGroup: (grouped: boolean) => void;
    onPick: (emote: EmoteInfo, keepOpen: boolean) => void;
};

const TABS = EMOTE_TABS.map((value) => ({ value, label: EMOTE_TAB_LABELS[value] }));
const NOTHING_SELECTED = "Nothing selected";
const ROW_HEIGHT = 30;

export function EmotePicker({ tab, searching, view, gridKey, grouped, canGroup, nameOf, onTab, onGroup, onPick }: Props) {
    const tokens = useModernTokens();
    const [hoveredKey, setHoveredKey] = useState<string>();
    const [closed, setClosed] = useState<Record<string, boolean>>({});
    const emotes = useMemo(() => view.sections.flatMap((section) => section.emotes), [view]);
    const preview = emotes.find((emote) => emoteKey(emote) === hoveredKey) ?? emotes[0];
    const previewName = preview ? nameOf(preview) : NOTHING_SELECTED;
    const previewSource = preview ? emoteSourceLabel(preview) : "";
    const isOpen = useCallback((title: string) => !closed[`${gridKey}:${title}`], [closed, gridKey]);
    const toggle = (title: string) => setClosed((current) => ({ ...current, [`${gridKey}:${title}`]: !current[`${gridKey}:${title}`] }));
    return (
        <View style={{ flex: 1 }}>
            <View
                style={{
                    height: ROW_HEIGHT,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingRight: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: tokens.lineSubtle,
                }}
            >
                {searching ? <View /> : <Tabs testID="emote-tabs" tabs={TABS} value={tab} onChange={onTab} height={ROW_HEIGHT - 1} inset={10} gap={14} />}
                <EmoteGroupSwitch value={grouped} disabled={!canGroup} onChange={onGroup} />
            </View>
            {view.empty ? (
                <EmptyState testID="emote-popup-empty" title={view.empty.title} description={view.empty.description} />
            ) : (
                <EmoteTileGrid
                    key={gridKey}
                    testID="emote-popup-list"
                    sections={view.sections}
                    note={view.note}
                    selectedKey={hoveredKey}
                    isOpen={isOpen}
                    onToggle={toggle}
                    onHover={(emote) => setHoveredKey(emoteKey(emote))}
                    onPick={onPick}
                />
            )}
            <EmotePreview emote={preview} name={previewName} source={previewSource} />
        </View>
    );
}
