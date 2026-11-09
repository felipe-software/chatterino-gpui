import { useEffect, useState } from "react";
import { Text, View, type LayoutChangeEvent } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";

const TICK_MS = 1000;

function twoDigits(value: number): string {
    return String(value).padStart(2, "0");
}

export function formatClock(startedAt: number, now: number): string {
    const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${twoDigits(minutes)}:${twoDigits(seconds % 60)}`;
}

export function UptimeText({ startedAt }: { startedAt: number }) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const [now, setNow] = useState(() => Date.now());
    const [minWidth, setMinWidth] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), TICK_MS);
        return () => clearInterval(timer);
    }, []);

    const keepWidest = (event: LayoutChangeEvent) => {
        const width = Math.ceil(event.nativeEvent.layout.width);
        setMinWidth((current) => Math.max(current, width));
    };

    return (
        <View style={{ minWidth, flexShrink: 0 }} onLayout={keepWidest}>
            <Text numberOfLines={1} style={{ color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>
                {formatClock(startedAt, now)}
            </Text>
        </View>
    );
}
