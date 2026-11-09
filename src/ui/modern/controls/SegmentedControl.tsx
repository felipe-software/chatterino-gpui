import { useState } from "react";
import { View, type LayoutChangeEvent } from "@felipe-software/react-native-gpui";
import { Segment, segmentSelectedColor, segmentShadow, type SegmentLayout } from "./Segment";
import { SegmentIndicator } from "./SegmentIndicator";
import { useModernTokens } from "./useModernTokens";

export type SegmentOption<T extends string> = { value: T; label: string };

type Props<T extends string> = {
    options: Array<SegmentOption<T>>;
    value: T;
    onChange: (value: T) => void;
    grow?: boolean;
    disabled?: boolean;
    testID?: string;
};

const SEGMENT_HEIGHT = 26;

export function SegmentedControl<T extends string>({ options, value, onChange, grow = false, disabled = false, testID }: Props<T>) {
    const tokens = useModernTokens();
    const [layouts, setLayouts] = useState<Record<string, SegmentLayout>>({});
    const [rowX, setRowX] = useState<number | null>(null);
    const measured = layouts[value];
    const selected = measured && rowX !== null ? { x: measured.x - rowX, width: measured.width } : undefined;
    const measure = (key: string, layout: SegmentLayout) => {
        setLayouts((current) => {
            const previous = current[key];
            if (previous && previous.x === layout.x && previous.width === layout.width) return current;
            return { ...current, [key]: layout };
        });
    };
    return (
        <View
            testID={testID}
            accessibilityRole="radiogroup"
            style={{
                alignSelf: grow ? "stretch" : "flex-start",
                padding: 2,
                borderWidth: 1,
                borderRadius: 8,
                borderColor: disabled ? tokens.lineSubtle : tokens.lineStrong,
                backgroundColor: disabled ? tokens.bgChat : tokens.bgInput,
                opacity: disabled ? 0.6 : 1,
            }}
        >
            <View style={{ flexDirection: "row", gap: 2 }} onLayout={(event: LayoutChangeEvent) => setRowX(event.nativeEvent.layout.x)}>
                {selected ? (
                    <SegmentIndicator
                        x={selected.x}
                        width={selected.width}
                        height={SEGMENT_HEIGHT}
                        color={segmentSelectedColor(tokens, disabled)}
                        shadow={segmentShadow(tokens, disabled)}
                    />
                ) : null}
                {options.map((option) => (
                    <Segment
                        key={option.value}
                        testID={testID ? `${testID}-${option.value}` : undefined}
                        label={option.label}
                        selected={option.value === value}
                        grow={grow}
                        disabled={disabled}
                        drawsSelection={!selected}
                        onPress={() => onChange(option.value)}
                        onMeasure={(layout) => measure(option.value, layout)}
                    />
                ))}
            </View>
        </View>
    );
}
