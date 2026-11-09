import { useState } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import type { LiveStatus } from "../../../data/api";
import { useApp } from "../../state/AppContext";
import { Avatar } from "../controls/Avatar";
import { HoverLayer } from "../controls/HoverLayer";
import { IconButton } from "../controls/IconButton";
import { LiveDot } from "../controls/LiveDot";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_ICONS } from "../icons";
import { uptimeLabel } from "./useNow";

type Props = { testID: string; name: string; status: LiveStatus | undefined; now: number; first: boolean; onRemove: () => void };

function statusLabel(status: LiveStatus | undefined, now: number): string | undefined {
    if (!status) return undefined;
    if (!status.live) return "Offline";
    return status.startedAt ? `Live · ${uptimeLabel(status.startedAt, now)}` : "Live";
}

export function LiveChannelRow({ testID, name, status, now, first, onRemove }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const [hovered, setHovered] = useState(false);
    const live = !!status?.live;
    const label = statusLabel(status, now);
    return (
        <View
            testID={testID}
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                minHeight: first ? 48 : 49,
                paddingLeft: 16,
                paddingRight: 8,
                borderTopWidth: first ? 0 : 1,
                borderTopColor: tokens.lineSubtle,
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <HoverLayer hovered={hovered} radius={0} color={tokens.bgHover} />
            <Avatar name={name} size={28} borderWidth={2} borderColor={live ? tokens.live : tokens.lineStrong} />
            <Text
                numberOfLines={1}
                style={{
                    flexGrow: 1,
                    flexShrink: 1,
                    flexBasis: 0,
                    minWidth: 0,
                    color: tokens.text,
                    fontFamily: fonts.uiFamily,
                    fontSize: 14,
                    lineHeight: 20,
                    fontWeight: "500",
                }}
            >
                {name}
            </Text>
            {label ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    {live ? <LiveDot /> : null}
                    <Text style={{ color: live ? tokens.text2 : tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>{label}</Text>
                </View>
            ) : null}
            <IconButton testID={`${testID}-remove`} icon={MODERN_ICONS.close} iconSize={16} tone="danger" label={`Remove ${name}`} onPress={() => onRemove()} />
        </View>
    );
}
