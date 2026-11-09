import { Image, NativeClipboard, Text, View } from "@felipe-software/react-native-gpui";
import type { ChatListBadgeElement } from "../../../native/chatList";
import { localizeNumber } from "../../format";
import { useApp } from "../../state/AppContext";
import { Avatar } from "../controls/Avatar";
import { IconButton } from "../controls/IconButton";
import { LiveDot } from "../controls/LiveDot";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_ICONS } from "../icons";
import { POPUP_ICONS } from "./icons";

type Props = {
    displayName: string;
    color: string;
    avatarUrl?: string;
    idText: string;
    id?: string;
    badges: ChatListBadgeElement[];
    liveViewers?: number;
    pinned: boolean;
    onPin: () => void;
    onClose: () => void;
    onProfile: () => void;
};

const BADGE_SIZE = 18;

export function UserCardHeader({ displayName, color, avatarUrl, idText, id, badges, liveViewers, pinned, onPin, onClose, onProfile }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const small = { color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 18 };
    const badgeTitle = badges.find((badge) => badge.tooltip)?.tooltip;
    const isLive = liveViewers !== undefined;
    return (
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
            <View
                testID="user-card-avatar"
                accessibilityRole="button"
                accessibilityLabel="Open profile"
                style={{ marginTop: 6, borderRadius: 30, cursor: "pointer" }}
                onClick={onProfile}
            >
                <Avatar name={displayName} uri={avatarUrl} size={60} color={color} />
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 4, paddingTop: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text
                        testID="user-card-name"
                        numberOfLines={1}
                        style={{ flexShrink: 1, color, fontFamily: fonts.uiFamily, fontSize: 18, lineHeight: 24, fontWeight: "600" }}
                    >
                        {displayName}
                    </Text>
                    <IconButton
                        testID="user-card-copy-name"
                        icon={MODERN_ICONS.copy}
                        label="Copy name"
                        size={26}
                        iconSize={14}
                        tone="muted"
                        onPress={() => NativeClipboard.setString(displayName)}
                    />
                </View>
                {badges.length > 0 ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <View style={{ flexDirection: "row", gap: 3 }}>
                            {badges.map((badge) => (
                                <Image
                                    key={badge.name}
                                    accessibilityLabel={badge.tooltip ?? badge.name}
                                    source={{ uri: badge.url }}
                                    style={{ width: BADGE_SIZE, height: BADGE_SIZE, borderRadius: 3 }}
                                    resizeMode="contain"
                                />
                            ))}
                        </View>
                        {badgeTitle ? (
                            <Text numberOfLines={1} style={{ ...small, flexShrink: 1 }}>
                                {badgeTitle}
                            </Text>
                        ) : null}
                    </View>
                ) : null}
                {isLive ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <LiveDot />
                        <Text style={small}>{`Live with ${localizeNumber(liveViewers ?? 0)} viewers`}</Text>
                    </View>
                ) : null}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                    <Text numberOfLines={1} style={{ ...small, flexShrink: 1, color: tokens.text3 }}>
                        {idText}
                    </Text>
                    {id ? (
                        <IconButton
                            testID="user-card-copy-id"
                            icon={MODERN_ICONS.copy}
                            label="Copy ID"
                            size={20}
                            iconSize={12}
                            tone="muted"
                            onPress={() => NativeClipboard.setString(id)}
                        />
                    ) : null}
                </View>
            </View>
            <View style={{ flexDirection: "row", gap: 2 }}>
                <IconButton testID="user-card-pin" icon={POPUP_ICONS.pin} label="Pin card" iconSize={16} selected={pinned} onPress={onPin} />
                <IconButton testID="user-card-close" icon={MODERN_ICONS.close} label="Close" iconSize={16} onPress={onClose} />
            </View>
        </View>
    );
}
