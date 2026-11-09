import { useState } from "react";
import { Text, View, type LayoutChangeEvent, type MouseResponderEvent } from "@felipe-software/react-native-gpui";
import type { LiveStatus } from "../../../data/api";
import { localizeNumber } from "../../format";
import { useApp } from "../../state/AppContext";
import { IconButton } from "../controls/IconButton";
import { LiveDot } from "../controls/LiveDot";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_ICONS } from "../icons";
import { SPLIT_ICONS } from "./icons";
import { UptimeText } from "./UptimeText";

export type ModerationToggle = { enabled: boolean; onToggle: () => void; onSettings: () => void };

export type ModernHeaderHandlers = {
    dragDown: (event: MouseResponderEvent) => void;
    dragMove: (event: MouseResponderEvent) => void;
    dragUp: (event: MouseResponderEvent) => void;
    hoverTitle: () => void;
    leaveTitle: () => void;
    menu: (x: number, y: number, alignRight: boolean) => void;
    search: () => void;
    addSplit: () => void;
    viewers: () => void;
};

type Props = {
    splitId: string;
    name: string;
    live: LiveStatus | undefined;
    hasChannel: boolean;
    focused: boolean;
    filtered: boolean;
    modes: string;
    compact: boolean;
    showSearch: boolean;
    showAddSplit: boolean;
    moderation?: ModerationToggle;
    handlers: ModernHeaderHandlers;
};

const DETAILS_SHRINK = 1000;
const MIN_DETAILS_WIDTH = 28;

export const MODERN_HEADER_HEIGHT = 44;
export const MODERN_COMPACT_HEADER_HEIGHT = 40;

export function ModernSplitHeader({ splitId, name, live, hasChannel, focused, filtered, modes, compact, showSearch, showAddSplit, moderation, handlers }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const [titleWidth, setTitleWidth] = useState(0);
    const [collapseAt, setCollapseAt] = useState(-1);
    const height = compact ? MODERN_COMPACT_HEADER_HEIGHT : MODERN_HEADER_HEIGHT;
    const buttonSize = compact ? 32 : 34;
    const iconSize = compact ? 17 : 18;
    const isLive = !!live?.live;
    const isOffline = !!live && !live.live;
    const startedAt = isLive ? live?.startedAt : undefined;
    const game = isLive ? live?.game : undefined;
    const viewers = localizeNumber(live?.viewers ?? 0);
    const small = { fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 };
    const nameColor = hasChannel ? tokens.text : tokens.text3;
    const cornerRadius = compact ? 5 : 0;
    const offlineLabel = isOffline ? "Offline" : "";
    const lead = game ?? offlineLabel;
    const leadColor = game ? tokens.text2 : tokens.text3;
    const extras = [modes, filtered ? "Filtered" : ""].filter((part) => part.length > 0);
    const extrasText = extras.join(" · ");
    const trailingSeparator = lead && extrasText ? " · " : "";
    const trailing = extrasText ? `${trailingSeparator}${extrasText}` : "";
    const hasDetails = lead.length > 0 || trailing.length > 0;
    const showDetails = hasDetails && titleWidth > collapseAt;

    const measureTitle = (event: LayoutChangeEvent) => setTitleWidth(Math.round(event.nativeEvent.layout.width));
    const measureDetails = (event: LayoutChangeEvent) => {
        if (event.nativeEvent.layout.width < MIN_DETAILS_WIDTH) setCollapseAt(titleWidth);
    };

    const openMenuFrom = (event: MouseResponderEvent) => {
        if (event.nativeEvent.pressDrag) return;
        const { pageX, pageY, locationX, locationY } = event.nativeEvent;
        handlers.menu(pageX - locationX + buttonSize, pageY - locationY + buttonSize, true);
    };

    return (
        <View
            testID={`split-header-${splitId}`}
            accessibilityLabel={name}
            accessibilityState={{ selected: focused }}
            style={{
                height,
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
                paddingLeft: 12,
                paddingRight: compact ? 4 : 6,
                backgroundColor: tokens.bgRaised,
                borderBottomWidth: 1,
                borderBottomColor: tokens.lineSubtle,
                borderTopLeftRadius: cornerRadius,
                borderTopRightRadius: cornerRadius,
            }}
            onContextMenu={(event) => handlers.menu(event.nativeEvent.pageX, event.nativeEvent.pageY, false)}
        >
            <View
                testID={`split-title-${splitId}`}
                nativeListGroup={`drag-${splitId}`}
                style={{ flex: 1, minWidth: 0, alignSelf: "stretch", flexDirection: "row", alignItems: "center", gap: 8, overflow: "hidden", cursor: "default" }}
                onMouseDown={handlers.dragDown}
                onMouseMove={handlers.dragMove}
                onMouseUp={handlers.dragUp}
                onMouseEnter={handlers.hoverTitle}
                onMouseLeave={handlers.leaveTitle}
                onLayout={measureTitle}
            >
                <View style={{ flexShrink: 1, minWidth: 0, overflow: "hidden" }}>
                    <Text numberOfLines={1} style={{ color: nameColor, fontFamily: fonts.uiFamily, fontSize: 14, lineHeight: 20, fontWeight: "600" }}>
                        {name}
                    </Text>
                </View>
                {isLive ? <LiveDot /> : null}
                {startedAt !== undefined ? <UptimeText startedAt={startedAt} /> : null}
                {startedAt !== undefined && showDetails ? <Text style={{ ...small, flexShrink: 0, color: tokens.text3 }}>·</Text> : null}
                {showDetails ? (
                    <View style={{ flexShrink: DETAILS_SHRINK, minWidth: 0, overflow: "hidden" }} onLayout={measureDetails}>
                        <Text testID={`split-details-${splitId}`} numberOfLines={1} style={{ ...small, color: leadColor, fontWeight: "500" }}>
                            {lead}
                            {trailing ? <Text style={{ color: tokens.text3, fontWeight: "400" }}>{trailing}</Text> : null}
                        </Text>
                    </View>
                ) : null}
            </View>
            {moderation ? (
                <IconButton
                    testID={`split-moderation-${splitId}`}
                    icon={SPLIT_ICONS.moderation}
                    label={moderation.enabled ? "Disable moderation mode" : "Enable moderation mode"}
                    size={buttonSize}
                    iconSize={iconSize}
                    selected={moderation.enabled}
                    onPress={moderation.onToggle}
                    onContextMenu={moderation.onSettings}
                />
            ) : null}
            {isLive ? (
                <IconButton
                    testID={`split-viewers-${splitId}`}
                    icon={MODERN_ICONS.eye}
                    label={`Viewers, ${viewers}`}
                    text={viewers}
                    height={buttonSize}
                    iconSize={iconSize}
                    onPress={handlers.viewers}
                />
            ) : null}
            {showSearch ? (
                <IconButton testID={`split-search-${splitId}`} icon={MODERN_ICONS.search} label="Search messages" size={buttonSize} iconSize={iconSize} onPress={handlers.search} />
            ) : null}
            {showAddSplit ? (
                <IconButton testID={`split-add-${splitId}`} icon={SPLIT_ICONS.addSplit} label="Add split" size={buttonSize} iconSize={iconSize} onPress={handlers.addSplit} />
            ) : null}
            <IconButton
                testID={`split-menu-${splitId}`}
                icon={MODERN_ICONS.kebab}
                label="Split menu"
                size={buttonSize}
                iconSize={iconSize}
                onPress={() => undefined}
                onMouseDown={openMenuFrom}
            />
        </View>
    );
}
