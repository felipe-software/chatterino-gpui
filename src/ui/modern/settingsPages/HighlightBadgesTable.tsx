import { Text } from "@felipe-software/react-native-gpui";
import type { HighlightBadge } from "../../../data/api";
import { useSettingsActions } from "../../settings/useSettingsActions";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { useApp } from "../../state/AppContext";
import { IconButton } from "../controls/IconButton";
import { Swatch } from "../controls/Swatch";
import { useModernTokens } from "../controls/useModernTokens";
import { DragHandle } from "./DragHandle";
import { FlagCell } from "./FlagCell";
import { swatchColor } from "./highlightColors";
import { PAGE_ICONS } from "./pageIcons";
import { SettingsTable } from "./SettingsTable";
import { SoundFileButton } from "./SoundFileButton";
import { moveItem, removeAt, replaceAt, type ModernColumn } from "./tableModel";

type BadgeFlag = "showInMentions" | "alert" | "playSound";

const METRICS = { gap: 10, paddingLeft: 12, paddingRight: 12, minRowHeight: 44 };
const FLAG_WIDTH = 64;

export function HighlightBadgesTable() {
    const { settings, fonts } = useApp();
    const tokens = useModernTokens();
    const { update } = useSettingsUpdate();
    const actions = useSettingsActions();
    const badges = settings.highlightBadges;
    const save = (highlightBadges: HighlightBadge[]) => update({ highlightBadges });
    const set = (index: number, patch: Partial<HighlightBadge>) => save(replaceAt(badges, index, patch));

    const flag = (key: BadgeFlag, title: string): ModernColumn<HighlightBadge> => ({
        key,
        title,
        width: FLAG_WIDTH,
        render: (row, index, state) => (
            <FlagCell testID={`highlight-badge-${key}-${index}`} value={row[key]} onChange={(next) => set(index, { [key]: next })}>
                {key === "playSound" ? (
                    <SoundFileButton
                        testID={`highlight-badge-sound-file-${index}`}
                        path={row.soundUrl}
                        visible={state.hovered}
                        onPress={() => actions.pickSound((soundUrl) => set(index, { soundUrl }))}
                    />
                ) : null}
            </FlagCell>
        ),
    });

    const columns: Array<ModernColumn<HighlightBadge>> = [
        { key: "lead", width: 30, render: (_row, index, state) => <DragHandle state={state} testID={`highlight-badge-grip-${index}`} /> },
        {
            key: "color",
            width: 18,
            render: (row, index) => (
                <Swatch
                    testID={`highlight-badge-color-${index}`}
                    color={swatchColor(row.color)}
                    onPress={() => actions.pickColor(row.color, (color) => set(index, { color }))}
                />
            ),
        },
        {
            key: "name",
            title: "Badge",
            flex: 1,
            render: (row) => (
                <Text numberOfLines={1} style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 }}>
                    {row.displayName}
                </Text>
            ),
        },
        flag("showInMentions", "Mentions"),
        flag("alert", "Flash"),
        flag("playSound", "Sound"),
        {
            key: "remove",
            width: 32,
            render: (row, index) => (
                <IconButton
                    testID={`highlight-badge-remove-${index}`}
                    icon={PAGE_ICONS.trash}
                    iconSize={16}
                    tone="danger"
                    label={`Remove ${row.displayName}`}
                    onPress={() => save(removeAt(badges, index))}
                />
            ),
        },
    ];

    return (
        <SettingsTable
            testID="highlight-badges"
            columns={columns}
            rows={badges}
            metrics={METRICS}
            reorder={{ first: 0, last: badges.length - 1, onMove: (from, to) => save(moveItem(badges, from, to)) }}
        />
    );
}
