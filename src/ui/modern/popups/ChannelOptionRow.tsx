import type { ReactNode } from "react";
import { Svg, Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { FadeLayer } from "../controls/FadeLayer";
import { HoverLayer } from "../controls/HoverLayer";
import { Radio } from "../controls/Radio";
import { useModernTokens } from "../controls/useModernTokens";
import { usePressState } from "../controls/usePressState";

type Props = {
    testID: string;
    label: string;
    description: string;
    icon: string;
    selected: boolean;
    disabled: boolean;
    onSelect: () => void;
    children?: ReactNode;
};

const DISABLED_OPACITY = 0.45;
const RADIUS = 8;

export function ChannelOptionRow({ testID, label, description, icon, selected, disabled, onSelect, children }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const press = usePressState(disabled);
    const showHover = press.hovered && !selected;
    const contentOpacity = disabled ? DISABLED_OPACITY : 1;
    const select = disabled ? undefined : onSelect;
    return (
        <View style={{ borderRadius: RADIUS }}>
            <FadeLayer visible={selected} color={tokens.accentSoft} radius={RADIUS} />
            <View
                testID={testID}
                accessibilityRole="radio"
                accessibilityLabel={label}
                accessibilityState={{ selected, disabled }}
                style={{
                    minHeight: 52,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: RADIUS,
                    cursor: disabled ? "default" : "pointer",
                }}
                {...press.handlers}
                onClick={select}
            >
                <HoverLayer hovered={showHover} pressed={press.pressed && !selected} radius={RADIUS} color={tokens.bgHover} pressColor={tokens.bgPress} />
                <Radio selected={selected} disabled={disabled} hovered={press.hovered} onSelect={onSelect} />
                <View
                    style={{
                        width: 32,
                        height: 32,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                        backgroundColor: selected ? tokens.bgRaised : tokens.bgInput,
                        opacity: contentOpacity,
                    }}
                >
                    <Svg name={icon} style={{ width: 17, height: 17, color: selected ? tokens.accent : tokens.text2 }} />
                </View>
                <View style={{ flex: 1, minWidth: 0, gap: 1, opacity: contentOpacity }}>
                    <Text style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 14, lineHeight: 20, fontWeight: "600" }}>{label}</Text>
                    <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>{description}</Text>
                </View>
            </View>
            {children ? <View style={{ paddingLeft: 74, paddingRight: 12, paddingBottom: 12 }}>{children}</View> : null}
        </View>
    );
}
