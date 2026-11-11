import type { Settings } from "../api";

type EnumRule = { path: string; values: Record<string, string> };

const KEY_MODIFIERS = { "0": "none", "33554432": "shift", "67108864": "control", "134217728": "alt", "268435456": "meta" };
const RIGHT_CLICK = { "0": "reply", "1": "mention", "2": "ignore" };

export const ENUM_PATHS: Partial<Record<keyof Settings, EnumRule>> = {
    tabDirection: { path: "/appearance/tabDirection", values: { "0": "top", "1": "left", "2": "right", "3": "bottom" } },
    tabStyle: { path: "/appearance/tabStyle", values: { Normal: "normal", Compact: "compact" } },
    pauseChatModifier: { path: "/behaviour/pauseChatModifier", values: KEY_MODIFIERS },
    messageOverflow: { path: "/appearance/messages/messageOverflow", values: { "0": "highlight", "1": "prevent", "2": "allow" } },
    usernameRightClickBehavior: { path: "/behaviour/usernameRightClickBehavior", values: RIGHT_CLICK },
    usernameRightClickModifierBehavior: { path: "/behaviour/usernameRightClickBehaviorWithModifier", values: RIGHT_CLICK },
    usernameRightClickModifier: { path: "/behaviour/usernameRightClickModifier", values: KEY_MODIFIERS },
    lastMessagePattern: { path: "/appearance/messages/lastMessagePattern", values: { "1": "solid", "10": "dotted" } },
    emotesTooltipPreview: { path: "/misc/emotesTooltipPreview", values: { "0": "dontShow", "1": "alwaysShow", "2": "showOnShift" } },
    emoteTooltipScale: { path: "/emotes/tooltipScale", values: { Small: "small", Medium: "medium", Large: "large", Huge: "huge" } },
    emojiSet: { path: "/emotes/emojiSet", values: { Twitter: "twitter", Facebook: "facebook", Apple: "apple", Google: "google" } },
    soundBackend: { path: "/sound/backend", values: { Miniaudio: "miniaudio", Null: "null" } },
    usernameDisplayMode: {
        path: "/appearance/messages/usernameDisplayMode",
        values: { "1": "username", "2": "localizedName", "3": "usernameAndLocalizedName" },
    },
    showBlockedTermAutomodMessages: { path: "/moderation/showBlockedTermAutomodMessages", values: { Always: "always", Never: "never" } },
    timeoutStackStyle: { path: "/moderation/timeoutStackStyle", values: { "0": "stack", "1": "stackUntilTimeout", "2": "dontStack" } },
    chatSendProtocol: { path: "/misc/chatSendProtocol", values: { Default: "default", IRC: "irc", Helix: "helix" } },
    showBlockedUsersMessages: { path: "/ignore/showBlockedUsers", values: { "0": "never", "1": "moderator", "2": "broadcaster" } },
    streamlinkQuality: {
        path: "/external/streamlink/quality",
        values: { Choose: "choose", Source: "source", High: "high", Medium: "medium", Low: "low", AudioOnly: "audioOnly" },
    },
    streamerMode: { path: "/streamerMode/enabled", values: { "0": "off", "1": "on", "2": "auto" } },
};
