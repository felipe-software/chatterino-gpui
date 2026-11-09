import { useRef } from "react";
import { Svg, Text, View, type MouseResponderEvent } from "@felipe-software/react-native-gpui";
import type { IgnoredPhrase } from "../../../data/api";
import { DEFAULT_IGNORE_REPLACEMENT, isBlockPhrase } from "../../../data/filters/ignores";
import { useApp } from "../../state/AppContext";
import type { MenuEntry } from "../../state/overlays";
import { Code } from "../controls/Code";
import { CONTROL_ICONS } from "../controls/icons";
import { useMenuHost } from "../controls/MenuHost";
import { useModernTokens } from "../controls/useModernTokens";
import { EditableText } from "./EditableText";

const MENU_GAP = 4;

type Props = { testID: string; phrase: IgnoredPhrase; onChange: (patch: Partial<IgnoredPhrase>) => void };

export function IgnoreActionCell({ testID, phrase, onChange }: Props) {
    const { fonts, openOverlay } = useApp();
    const tokens = useModernTokens();
    const host = useMenuHost();
    const size = useRef({ width: 0, height: 0 });
    const blocking = isBlockPhrase(phrase);
    const replacement = phrase.replaceWith ?? DEFAULT_IGNORE_REPLACEMENT;
    const textStyle = { color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 };

    const open = (event: MouseResponderEvent) => {
        const left = event.nativeEvent.pageX - event.nativeEvent.locationX;
        const top = event.nativeEvent.pageY - event.nativeEvent.locationY;
        const entries: MenuEntry[] = [
            { kind: "item", label: "Hide the message", radio: true, checked: blocking, onSelect: () => onChange({ isBlock: true, replaceWith: replacement }) },
            {
                kind: "item",
                label: "Replace the match",
                radio: true,
                checked: !blocking,
                onSelect: () => onChange({ isBlock: false, replaceWith: replacement }),
            },
        ];
        const request = { x: left, y: top + size.current.height + MENU_GAP, entries };
        if (host) host.open(request);
        else openOverlay({ kind: "menu", ...request });
    };

    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minWidth: 0 }}>
            <View
                testID={`${testID}-mode`}
                accessibilityRole="button"
                accessibilityLabel={blocking ? "Hide the message" : "Replace with"}
                style={{ flexDirection: "row", alignItems: "center", gap: 2, cursor: "pointer" }}
                onLayout={(event) => {
                    size.current = { width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height };
                }}
                onClick={open}
            >
                <Text numberOfLines={1} style={textStyle}>
                    {blocking ? "Hide the message" : "Replace with"}
                </Text>
                <Svg name={CONTROL_ICONS.chevronDown} style={{ width: 14, height: 14, color: tokens.text3 }} />
            </View>
            {blocking ? null : (
                <View style={{ flexShrink: 1, minWidth: 0 }}>
                    <EditableText
                        testID={`${testID}-replacement`}
                        value={replacement}
                        monospace
                        fontSize={12}
                        display={<Code text={replacement} size={12} />}
                        onCommit={(replaceWith) => onChange({ replaceWith })}
                    />
                </View>
            )}
        </View>
    );
}
