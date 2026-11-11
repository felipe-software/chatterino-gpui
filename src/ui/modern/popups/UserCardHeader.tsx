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
    const detail = [badgeTitle, isLive ? `Live with ${localizeNumber(liveViewers ?? 0)} viewers` : undefined, idText].filter(Boolean).join(" · ");
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View testID="user-card-avatar" accessibilityRole="button" accessibilityLabel="Open profile" style={{ borderRadius: 22, cursor: "pointer" }} onClick={onProfile}>
                <Avatar name={displayName} uri={avatarUrl} size={44} color={color} />
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 2, minWidth: 0 }}>
                    <Text
                        testID="user-card-name"
                        numberOfLines={1}
                        style={{ flexShrink: 1, color, fontFamily: fonts.uiFamily, fontSize: 16, lineHeight: 22, fontWeight: "600" }}
                    >
                        {displayName}
                    </Text>
                    <IconButton
                        testID="user-card-copy-name"
                        icon={MODERN_ICONS.copy}
                        label="Copy name"
                        size={24}
                        iconSize={14}
                        tone="muted"
                        onPress={() => NativeClipboard.setString(displayName)}
                    />
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minWidth: 0 }}>
                    {badges.slice(0, 3).map((badge) => (
                        <Image
                            key={badge.name}
                            accessibilityLabel={badge.tooltip ?? badge.name}
                            source={{ uri: badge.url }}
                            style={{ width: BADGE_SIZE, height: BADGE_SIZE, borderRadius: 3 }}
                            resizeMode="contain"
                        />
                    ))}
                    {isLive ? <LiveDot /> : null}
                    <Text testID="user-card-detail" numberOfLines={1} style={{ ...small, flexShrink: 1 }}>
                        {detail}
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
            <View style={{ alignSelf: "flex-start", flexDirection: "row" }}>
                <IconButton testID="user-card-pin" icon={POPUP_ICONS.pin} label="Pin card" size={30} iconSize={16} selected={pinned} onPress={onPin} />
                <IconButton testID="user-card-close" icon={MODERN_ICONS.close} label="Close" size={30} iconSize={16} onPress={onClose} />
            </View>
        </View>
    );
}
