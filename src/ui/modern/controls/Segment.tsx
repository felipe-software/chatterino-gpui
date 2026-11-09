import { Text, View, type LayoutChangeEvent } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import type { ModernTokens } from "../tokens";
import { HoverLayer } from "./HoverLayer";
import { useModernTokens } from "./useModernTokens";
import { usePressState } from "./usePressState";

export type SegmentLayout = { x: number; width: number };

type SegmentProps = {
    label: string;
    selected: boolean;
    grow: boolean;
    disabled: boolean;
    drawsSelection: boolean;
    testID?: string;
    onPress: () => void;
    onMeasure: (layout: SegmentLayout) => void;
};

export function segmentSelectedColor(tokens: ModernTokens, disabled: boolean): string {
    return disabled ? tokens.bgInput : tokens.segOn;
}

export function segmentShadow(tokens: ModernTokens, disabled: boolean): string | undefined {
    if (disabled || tokens.segShadow === "none") return undefined;
    return tokens.segShadow;
}

function segmentText(tokens: ModernTokens, selected: boolean, hovered: boolean, disabled: boolean): string {
    if (disabled) return tokens.text3;
    if (selected || hovered) return tokens.text;
    return tokens.text2;
}

export function Segment({ label, selected, grow, disabled, drawsSelection, testID, onPress, onMeasure }: SegmentProps) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const press = usePressState(disabled || selected);
    const ownSelection = selected && drawsSelection;
    return (
        <View
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected, disabled }}
            style={{
                height: 26,
                flexGrow: grow ? 1 : 0,
                flexBasis: grow ? 0 : undefined,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 10,
                borderRadius: 6,
                backgroundColor: ownSelection ? segmentSelectedColor(tokens, disabled) : undefined,
                boxShadow: ownSelection ? segmentShadow(tokens, disabled) : undefined,
                cursor: disabled ? "default" : "pointer",
            }}
            onLayout={(event: LayoutChangeEvent) => onMeasure({ x: event.nativeEvent.layout.x, width: event.nativeEvent.layout.width })}
            {...press.handlers}
            onClick={disabled ? undefined : onPress}
        >
            {selected || disabled ? null : <HoverLayer hovered={press.hovered} pressed={press.pressed} color={tokens.bgPress} pressColor={tokens.bgPress} />}
            <Text
                numberOfLines={1}
                style={{
                    color: segmentText(tokens, selected, press.hovered, disabled),
                    fontFamily: fonts.uiFamily,
                    fontSize: 13,
                    lineHeight: 16,
                    fontWeight: "500",
                }}
            >
                {label}
            </Text>
        </View>
    );
}
