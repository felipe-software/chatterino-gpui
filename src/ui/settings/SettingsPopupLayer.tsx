import { ScrollView, Text, View } from "@felipe-software/react-native-gpui";
import { DIALOG_HEADER_HEIGHT, DialogHeader } from "../modern/controls/DialogHeader";
import { Tooltip } from "../overlays/Tooltip";
import { useApp } from "../state/AppContext";
import { chromeColors } from "../theme";
import type { Point, PopupSpec } from "./SettingsContext";
import { SETTINGS_FONT_SIZE, SETTINGS_STYLE } from "./settingsStyle";

type Props = {
    width: number;
    height: number;
    popup: PopupSpec | null;
    tooltip: { text: string; at: Point } | null;
    onClose: () => void;
};

const LIST_ROW = 24;
const LIST_MAX_HEIGHT = 320;
const POPUP_BORDER = "#66bcff";
const TITLE_HEIGHT = 28;
const TOOLTIP_CURSOR_OFFSET = 16;
const SCRIM = "rgba(0, 0, 0, 0.35)";

export function SettingsPopupLayer({ width, height, popup, tooltip, onClose }: Props) {
    const { theme, fonts } = useApp();
    const colors = chromeColors(theme);
    const tokens = theme.modern;
    const text = { color: SETTINGS_STYLE.text, fontFamily: fonts.appFamily, fontSize: SETTINGS_FONT_SIZE };

    const renderList = (spec: Extract<PopupSpec, { kind: "list" }>) => {
        const listHeight = Math.min(LIST_MAX_HEIGHT, spec.options.length * LIST_ROW + 2);
        const below = spec.anchor.y + spec.anchor.height;
        const top = below + listHeight > height ? Math.max(0, spec.anchor.y - listHeight) : below;
        const left = Math.min(spec.anchor.x, Math.max(0, width - spec.anchor.width));
        return (
            <View
                testID="settings-popup-list"
                style={{ position: "absolute", left, top, width: spec.anchor.width, height: listHeight, backgroundColor: "#000000", borderWidth: 1, borderColor: POPUP_BORDER }}
            >
                <ScrollView style={{ flex: 1 }}>
                    {spec.options.map((option) => {
                        const selected = option.value === spec.selected;
                        return (
                            <View
                                key={option.value}
                                testID={`settings-option-${option.label}`}
                                accessibilityRole="menuitem"
                                accessibilityLabel={option.label}
                                style={{ height: LIST_ROW, justifyContent: "center", paddingHorizontal: 6, backgroundColor: selected ? colors.highlight : undefined }}
                                onClick={() => {
                                    onClose();
                                    spec.onSelect(option.value);
                                }}
                            >
                                <Text numberOfLines={1} style={text}>
                                    {option.label}
                                </Text>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        );
    };

    const renderModernModal = (spec: Extract<PopupSpec, { kind: "modal" }>) => {
        const modalWidth = Math.min(spec.width, width - 20);
        const modalHeight = Math.min(spec.height + DIALOG_HEADER_HEIGHT, height - 20);
        return (
            <View
                testID="settings-modal"
                style={{
                    position: "absolute",
                    left: Math.round((width - modalWidth) / 2),
                    top: Math.round((height - modalHeight) / 2),
                    width: modalWidth,
                    height: modalHeight,
                    overflow: "hidden",
                    backgroundColor: tokens?.bgRaised,
                    borderWidth: 1,
                    borderColor: tokens?.lineStrong,
                    borderRadius: 12,
                    boxShadow: tokens?.shadow,
                }}
            >
                <DialogHeader title={spec.title} closeTestID="settings-modal-close" showClose onClose={onClose} />
                <View style={{ flex: 1 }}>{spec.render(onClose)}</View>
            </View>
        );
    };

    const renderModal = (spec: Extract<PopupSpec, { kind: "modal" }>) => {
        if (tokens) return renderModernModal(spec);
        const modalWidth = Math.min(spec.width, width - 20);
        const modalHeight = Math.min(spec.height + TITLE_HEIGHT, height - 20);
        return (
            <View
                testID="settings-modal"
                style={{
                    position: "absolute",
                    left: Math.round((width - modalWidth) / 2),
                    top: Math.round((height - modalHeight) / 2),
                    width: modalWidth,
                    height: modalHeight,
                    backgroundColor: SETTINGS_STYLE.window,
                    borderWidth: 1,
                    borderColor: colors.outline,
                    boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.6)",
                }}
            >
                <View style={{ height: TITLE_HEIGHT, flexDirection: "row", alignItems: "center", paddingLeft: 10, backgroundColor: colors.titleBar }}>
                    <Text numberOfLines={1} style={{ ...text, flex: 1, fontSize: SETTINGS_FONT_SIZE - 1 }}>
                        {spec.title}
                    </Text>
                    <View testID="settings-modal-close" accessibilityLabel="Close" style={{ width: 36, height: TITLE_HEIGHT, alignItems: "center", justifyContent: "center" }} onClick={onClose}>
                        <Text style={text}>✕</Text>
                    </View>
                </View>
                <View style={{ flex: 1 }}>{spec.render(onClose)}</View>
            </View>
        );
    };

    const renderTooltip = (spec: { text: string; at: Point }) => {
        if (tokens) {
            const cursor = { x: spec.at.x - TOOLTIP_CURSOR_OFFSET, y: spec.at.y - TOOLTIP_CURSOR_OFFSET };
            return <Tooltip spec={{ owner: "settings", text: spec.text, anchor: { ...cursor, width: 0, height: 0 }, cursor, placement: "cursor" }} />;
        }
        return (
            <View
                testID="settings-tooltip"
                pointerEvents="none"
                style={{
                    position: "absolute",
                    left: Math.min(spec.at.x, width - 380),
                    top: Math.min(spec.at.y, height - 60),
                    maxWidth: 420,
                    padding: 2,
                    paddingHorizontal: 4,
                    backgroundColor: SETTINGS_STYLE.tooltipBackground,
                    borderWidth: 1,
                    borderColor: SETTINGS_STYLE.tooltipBorder,
                }}
            >
                <Text style={{ ...text, fontSize: SETTINGS_FONT_SIZE - 1 }}>{spec.text}</Text>
            </View>
        );
    };

    const scrim = popup?.kind === "modal" ? SCRIM : undefined;
    const backdropCloses = popup?.kind === "list";
    return (
        <>
            {popup ? (
                <View
                    testID="settings-popup-backdrop"
                    style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, backgroundColor: scrim }}
                    onMouseDown={backdropCloses ? onClose : undefined}
                />
            ) : null}
            {popup?.kind === "list" ? renderList(popup) : null}
            {popup?.kind === "modal" ? renderModal(popup) : null}
            {tooltip ? renderTooltip(tooltip) : null}
        </>
    );
}
