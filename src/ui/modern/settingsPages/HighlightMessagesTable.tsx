import { Text } from "@felipe-software/react-native-gpui";
import type { HighlightPhrase, Settings } from "../../../data/api";
import { MESSAGE_BUILTINS, type BuiltinRow, type MessageRow } from "../../settings/highlightRows";
import { useSettingsActions } from "../../settings/useSettingsActions";
import { useSettingsUpdate } from "../../settings/useSettingsUpdate";
import { useApp } from "../../state/AppContext";
import { IconButton } from "../controls/IconButton";
import { Swatch } from "../controls/Swatch";
import { Switch } from "../controls/Switch";
import { useModernTokens } from "../controls/useModernTokens";
import { DragHandle } from "./DragHandle";
import { EditableText } from "./EditableText";
import { FlagCell } from "./FlagCell";
import { swatchColor, toneColor } from "./highlightColors";
import { PAGE_ICONS } from "./pageIcons";
import { SettingsTable } from "./SettingsTable";
import { SoundFileButton } from "./SoundFileButton";
import { moveItem, removeAt, replaceAt, type CellState, type ModernColumn } from "./tableModel";

type Props = { autoEdit: number | null; onAutoEditDone: () => void };

type FlagKey = "mentions" | "taskbar" | "sound";
type PhraseFlag = "showInMentions" | "alert" | "playSound" | "isRegex" | "caseSensitive";

const METRICS = { gap: 10, paddingLeft: 12, paddingRight: 12, minRowHeight: 44 };
const FLAG_WIDTH = 52;

export function HighlightMessagesTable({ autoEdit, onAutoEditDone }: Props) {
    const { settings, fonts } = useApp();
    const tokens = useModernTokens();
    const { update } = useSettingsUpdate();
    const actions = useSettingsActions();
    const phrases = settings.highlightPhrases;
    const offset = MESSAGE_BUILTINS.length;
    const rows: MessageRow[] = [
        ...MESSAGE_BUILTINS.map((row): MessageRow => ({ kind: "builtin", row })),
        ...phrases.map((phrase): MessageRow => ({ kind: "phrase", phrase })),
    ];
    const savePhrases = (highlightPhrases: HighlightPhrase[]) => update({ highlightPhrases });
    const setPhrase = (index: number, patch: Partial<HighlightPhrase>) => savePhrases(replaceAt(phrases, index - offset, patch));
    const builtinValue = (row: BuiltinRow, key: FlagKey | undefined) => {
        const settingKey = key ? row[key] : undefined;
        return settingKey ? (settings[settingKey] as boolean) : undefined;
    };
    const flagValue = (row: MessageRow, key: FlagKey | undefined, phraseKey: PhraseFlag) => {
        if (row.kind === "phrase") return !!row.phrase[phraseKey];
        return builtinValue(row.row, key);
    };
    const soundPath = (row: MessageRow) => {
        if (row.kind === "phrase") return row.phrase.soundUrl;
        const soundKey = row.row.soundUrl;
        return soundKey ? (settings[soundKey] as string) : undefined;
    };
    const setBuiltin = (key: keyof Settings | undefined, value: boolean | string) => {
        if (key) update({ [key]: value } as Partial<Settings>);
    };

    const flag = (key: FlagKey | undefined, phraseKey: PhraseFlag, title: string): ModernColumn<MessageRow> => ({
        key: phraseKey,
        title,
        width: FLAG_WIDTH,
        render: (row, index, state) => {
            const value = flagValue(row, key, phraseKey);
            const builtinKey = row.kind === "builtin" && key ? row.row[key] : undefined;
            const change = (next: boolean) => (row.kind === "phrase" ? setPhrase(index, { [phraseKey]: next }) : setBuiltin(builtinKey, next));
            return (
                <FlagCell testID={`highlight-${phraseKey}-${index}`} value={value} onChange={change}>
                    {phraseKey === "playSound" ? soundButton(row, index, state) : null}
                </FlagCell>
            );
        },
    });

    const soundButton = (row: MessageRow, index: number, state: CellState) => {
        if (row.kind === "builtin" && !row.row.soundUrl) return null;
        const soundKey = row.kind === "builtin" ? row.row.soundUrl : undefined;
        const pick = () => actions.pickSound((next) => (row.kind === "phrase" ? setPhrase(index, { soundUrl: next }) : setBuiltin(soundKey, next)));
        return <SoundFileButton testID={`highlight-sound-file-${index}`} path={soundPath(row)} visible={state.hovered} onPress={pick} />;
    };

    const pickColor = (row: MessageRow, index: number) => {
        if (row.kind === "phrase") {
            actions.pickColor(row.phrase.color, (color) => setPhrase(index, { color }));
            return;
        }
        const current = (settings[row.row.color] as string) || row.row.fallbackColor;
        actions.pickColor(current, (color) => setBuiltin(row.row.color, color));
    };

    const columns: Array<ModernColumn<MessageRow>> = [
        {
            key: "lead",
            width: 30,
            render: (row, index, state) => {
                if (row.kind === "phrase") return <DragHandle state={state} testID={`highlight-grip-${index}`} />;
                const enabled = settings[row.row.enabled] as boolean;
                return (
                    <Switch
                        testID={`highlight-enabled-${index}`}
                        size="sm"
                        label={`Enable ${row.row.modernLabel}`}
                        value={enabled}
                        onChange={(value) => setBuiltin(row.row.enabled, value)}
                    />
                );
            },
        },
        {
            key: "color",
            width: 18,
            render: (row, index) => {
                const color = row.kind === "phrase" ? swatchColor(row.phrase.color) : toneColor(tokens, row.row.tone);
                return <Swatch testID={`highlight-color-${index}`} color={color} onPress={() => pickColor(row, index)} />;
            },
        },
        {
            key: "pattern",
            title: "Pattern",
            flex: 1,
            render: (row, index) => {
                if (row.kind === "phrase") {
                    return (
                        <EditableText
                            testID={`highlight-pattern-${index}`}
                            value={row.phrase.pattern}
                            monospace
                            autoEdit={autoEdit === index}
                            onDone={onAutoEditDone}
                            onCommit={(pattern) => setPhrase(index, { pattern })}
                        />
                    );
                }
                const enabled = settings[row.row.enabled] as boolean;
                return (
                    <Text
                        numberOfLines={1}
                        style={{ color: tokens.text, opacity: enabled ? 1 : 0.45, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 }}
                    >
                        {row.row.modernLabel}
                    </Text>
                );
            },
        },
        flag("mentions", "showInMentions", "Mentions"),
        flag("taskbar", "alert", "Flash"),
        flag("sound", "playSound", "Sound"),
        flag(undefined, "isRegex", "Regex"),
        flag(undefined, "caseSensitive", "Case"),
        {
            key: "remove",
            width: 32,
            render: (row, index) =>
                row.kind === "phrase" ? (
                    <IconButton
                        testID={`highlight-remove-${index}`}
                        icon={PAGE_ICONS.trash}
                        iconSize={16}
                        tone="danger"
                        label={`Remove ${row.phrase.pattern}`}
                        onPress={() => savePhrases(removeAt(phrases, index - offset))}
                    />
                ) : null,
        },
    ];

    return (
        <SettingsTable
            testID="highlight-phrases"
            columns={columns}
            rows={rows}
            metrics={METRICS}
            reorder={{ first: offset, last: rows.length - 1, onMove: (from, to) => savePhrases(moveItem(phrases, from - offset, to - offset)) }}
        />
    );
}
