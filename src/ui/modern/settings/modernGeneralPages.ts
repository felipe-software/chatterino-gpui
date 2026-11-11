import { ZOOM_LEVELS } from "../../settings/generalHelpers";
import type { DescriptionLink, SettingsAccess } from "../../settings/generalTypes";
import type { ModernGeneralPageName } from "./modernSettingsPages";

export type ModernOption = { value: string; label: string };

export type ModernItemRowSpec = {
    kind: "item";
    id: string;
    label?: string;
    hint?: string;
    segment?: boolean;
    options?: ModernOption[];
    relabel?: Record<string, string>;
    valueAlias?: Record<string, string>;
    unit?: string;
    wide?: boolean;
    placeholder?: string;
    buttonLabels?: Record<string, string>;
    pathValue?: (access: SettingsAccess) => string;
};

export type ModernLinksRowSpec = {
    kind: "links";
    id: string;
    label: string;
    hint?: string;
    links: Array<{ label: string; from: string }>;
};

export type ModernRowSpec = ModernItemRowSpec | ModernLinksRowSpec;

export type ModernProvider = { name: string; cells: Array<string | null> };

export type ModernBlock =
    | { kind: "rows"; rows: ModernRowSpec[] }
    | { kind: "theme"; system: ModernItemRowSpec[]; rows: ModernItemRowSpec[] }
    | { kind: "providers"; columns: string[]; providers: ModernProvider[] }
    | { kind: "badges"; badges: Array<{ id: string; label: string }> };

export type ModernSection = { title: string; description?: string; links?: DescriptionLink[]; blocks: ModernBlock[] };

export type ModernGeneralPage = { name: ModernGeneralPageName; description: string; sections: ModernSection[] };

export const THEME_ITEM_ID = "theme";
export const ACCENT_ITEM_ID = "accentColor";

export const LIGHT_ALIAS: Record<string, string> = { white: "light" };

export const THEME_TILES: ModernOption[] = [
    { value: "dark", label: "Dark" },
    { value: "black", label: "Black" },
    { value: "light", label: "Light" },
    { value: "system", label: "Match system" },
];

type RowExtra = Omit<ModernItemRowSpec, "kind" | "id" | "label">;

function row(id: string, label?: string, extra: RowExtra = {}): ModernItemRowSpec {
    return { kind: "item", id, label, ...extra };
}

function rows(...list: ModernRowSpec[]): ModernBlock {
    return { kind: "rows", rows: list };
}

function labels(values: Array<[string, string]>): ModernOption[] {
    return values.map(([value, label]) => ({ value, label }));
}

function percentLabel(value: number): string {
    return `${Math.round(value * 100)}%`;
}

const ZOOM_OPTIONS: ModernOption[] = ZOOM_LEVELS.map((value) => ({ value: String(value), label: percentLabel(value) }));

const RESTART = "Needs a restart";

const MODIFIER_LABELS = { control: "Ctrl" };

const RIGHT_CLICK_LABELS = { ignore: "Nothing" };

const CHATTERINO_TERMS = "https://braize.pajlada.com/chatterino/legal/terms-of-service";
const CHATTERINO_PRIVACY = "https://braize.pajlada.com/chatterino/legal/privacy-policy";

function appearance(): ModernGeneralPage {
    return {
        name: "Appearance",
        description: "Theme, accent, size and the window around your chat.",
        sections: [
            {
                title: "Theme",
                blocks: [
                    {
                        kind: "theme",
                        system: [
                            row("darkSystemTheme", "When the system is dark", { segment: true, options: labels([["dark", "Dark"], ["black", "Black"]]), valueAlias: LIGHT_ALIAS }),
                            row("lightSystemTheme", "When the system is light", { segment: true, options: labels([["light", "Light"], ["dark", "Dark"]]), valueAlias: LIGHT_ALIAS }),
                        ],
                        rows: [row("uiStyle", "Style", { hint: "Chatterino brings back the classic look", segment: true })],
                    },
                ],
            },
            {
                title: "Size",
                blocks: [rows(row("uiScale", "Zoom", { options: ZOOM_OPTIONS }), row("font", "Chat font", { hint: "Used by the Chatterino style. Modern draws chat in Inter" }))],
            },
            {
                title: "Tabs",
                blocks: [
                    rows(
                        row("tabDirection", "Tab position", { segment: true }),
                        row("tabVisibility", "Show tabs", { relabel: { live: "Only tabs with live channels" } }),
                        row("tabStyle", "Tab style", { segment: true }),
                        row("showTabCloseButton", "Close button on tabs"),
                        row("showTabLive", "Mark live channels", { hint: "A red dot before the channel name" }),
                        row("highlightMentions", "Highlight the mentions tab", { hint: "The /mentions tab turns red when someone mentions you" }),
                        row("disableTabRenamingOnClick", "Don't rename tabs on double-click"),
                    ),
                ],
            },
            {
                title: "Window",
                blocks: [
                    rows(
                        row("windowTopMost", "Always on top"),
                        row("hidePreferencesButton", "Settings button", { hint: "If you hide it, Ctrl+P brings it back" }),
                        row("hideUserButton", "Account button"),
                        row("autoCloseUserPopup", "Close user cards when they lose focus"),
                        row("autoCloseThreadPopup", "Close reply threads when they lose focus"),
                    ),
                ],
            },
        ],
    };
}

function chat(): ModernGeneralPage {
    return {
        name: "Chat",
        description: "How messages scroll, look and load.",
        sections: [
            {
                title: "Scrolling",
                blocks: [
                    rows(
                        row("pauseOnHoverDuration", "Pause on hover", {
                            hint: "Chat also pauses whenever you scroll up",
                            options: labels([
                                ["0", "Off"],
                                ["0.5", "0.5 seconds"],
                                ["1", "1 second"],
                                ["2", "2 seconds"],
                                ["5", "5 seconds"],
                                ["-1", "Until the mouse leaves"],
                            ]),
                        }),
                        row("pauseChatModifier", "Pause while holding a key", { relabel: MODIFIER_LABELS }),
                        row("mouseScrollMultiplier", "Scroll speed"),
                        row("enableSmoothScrolling", "Smooth scrolling"),
                        row("enableSmoothScrollingNewMessages", "Smooth scrolling on new messages"),
                        row("hideScrollbarThumb", "Hide the scrollbar thumb", { hint: "Also turns off dragging the scrollbar" }),
                        row("hideScrollbarHighlights", "Hide highlights in the scrollbar"),
                    ),
                ],
            },
            {
                title: "Messages",
                blocks: [
                    rows(
                        row("timestampFormat", "Timestamp format", { relabel: { Disable: "Off" } }),
                        row("showMessageSeparators", "Separate messages with lines"),
                        row("alternateMessageBackground", "Alternate row background"),
                        row("fadeMessageHistory", "Dim message history", { hint: "Messages loaded from before you joined" }),
                        row("showDeletedMessages", "Hide deleted messages"),
                        row("deletedMessageLengthLimit", "Shorten deleted messages to", { relabel: { "0": "Show in full" } }),
                        row("collapseMessagesMinLines", "Limit message height"),
                        row("messageOverflow", "When a message is too long to send", { relabel: { prevent: "Block sending" } }),
                        row("showLastMessageIndicator", "Mark where you left off", { hint: "Draws a line under the last message you saw before switching windows" }),
                        row("lastMessagePattern", "Line style", { segment: true }),
                        row("lastMessageColor", "Line colour"),
                        row("inlineWhispers", "Show whispers in every split"),
                        row("highlightInlineWhispers", "Highlight whispers shown in splits"),
                    ),
                ],
            },
            {
                title: "System messages",
                blocks: [
                    rows(
                        row("hideModerationActions", "Show moderation messages", { hint: "Timeouts, bans and other moderator actions" }),
                        row("hideDeletionActions", "Show single message deletions"),
                        row("timeoutStackStyle", "Stack timeouts"),
                        row("stackBits", "Combine bit tips into one cheer"),
                        row("showJoins", "Show joins", { hint: "Only in chats with fewer than 1,000 chatters" }),
                        row("showParts", "Show parts", { hint: "Only in chats with fewer than 1,000 chatters" }),
                        row("showTitleInLiveMessage", "Show the stream title in live messages"),
                        row("showBlockedTermAutomodMessages", "Blocked term AutoMod messages"),
                    ),
                ],
            },
            {
                title: "Replies and names",
                blocks: [
                    rows(
                        row("hideReplyContext", "Show what a message replies to"),
                        row("showReplyButton", "Reply button on hover"),
                        row("usernameRightClickBehavior", "Right-click a username", { relabel: RIGHT_CLICK_LABELS }),
                        row("usernameRightClickModifierBehavior", "Right-click with the modifier held", { relabel: RIGHT_CLICK_LABELS }),
                        row("usernameRightClickModifier", "Modifier key", { relabel: MODIFIER_LABELS }),
                        row("stripReplyMention", "Strip the leading mention in replies"),
                        row("autoSubToParticipatedThreads", "Subscribe to threads you reply in"),
                        row("usernameDisplayMode", "Username style"),
                        row("boldScale", "Username font weight"),
                        row("colorizeNicknames", "Colour users without a colour", { hint: "Gives grey names a random colour" }),
                        row("boldUsernames", "Bold @mentions"),
                        row("colorUsernames", "Colour @mentions", { hint: "Uses the Twitch colour of users you've seen" }),
                        row("findAllUsernames", "Find mentions without the @"),
                        row("showPronouns", "Show pronouns in user cards", { hint: "Fetched from pr.alejo.io when a card opens" }),
                    ),
                ],
            },
            {
                title: "Input",
                blocks: [
                    rows(
                        row("showEmptyInput", "Show the input when it is empty"),
                        row("showMessageLength", "Show message length while typing"),
                        row("showSendWaitTimer", "Show slow mode and timeout countdowns"),
                        row("allowDuplicateMessages", "Allow sending duplicate messages"),
                        row("pulseTextInputOnSelfMessage", "Pulse the input when a message sends"),
                        row("showSendButton", "Show a send button"),
                        row("mentionUsersWithComma", "Add a comma after a completed name", { hint: "Only at the start of a message: pajl → pajlada," }),
                        row("showUsernameCompletionMenu", "Show the username completion menu"),
                        row("alwaysIncludeBroadcasterInUserCompletions", "Always suggest the broadcaster"),
                        row("userCompletionOnlyWithAt", "Only complete usernames after @"),
                    ),
                ],
            },
            {
                title: "Links and media",
                description: "Link info is fetched through the Chatterino API. See its terms and privacy policy.",
                links: [
                    { label: "terms", url: CHATTERINO_TERMS },
                    { label: "privacy policy", url: CHATTERINO_PRIVACY },
                ],
                blocks: [
                    rows(
                        row("showLinkPreviews", "Load link info", { hint: "Page titles and video stats" }),
                        row("thumbnailSize", "Link thumbnails", { hint: "Shown in the link tooltip" }),
                        row("thumbnailSizeStream", "Stream thumbnails"),
                        row("linksDoubleClickOnly", "Open links with a double-click"),
                        row("lowercaseDomains", "Lowercase domains", { hint: "Makes look-alike phishing links easier to spot" }),
                        row("unshortLinks", "Unshorten copied links"),
                    ),
                ],
            },
            {
                title: "History",
                blocks: [
                    rows(
                        row("loadHistoryOnJoin", "Load message history on connect"),
                        row("historyLimit", "History messages to load"),
                        row("messageLimit", "Messages kept per split", { hint: RESTART }),
                        row("scrollbackUsercardLimit", "Messages kept per user card", { hint: RESTART }),
                    ),
                ],
            },
        ],
    };
}

function emotes(): ModernGeneralPage {
    return {
        name: "Emotes and badges",
        description: "What shows up next to names and inside messages.",
        sections: [
            {
                title: "Emotes",
                blocks: [
                    rows(
                        row("enableEmoteImages", "Show emotes"),
                        row("animateEmotes", "Animate emotes"),
                        row("animationsWhenFocused", "Only animate when Chatterino is focused"),
                        row("enableZeroWidthEmotes", "Zero-width emotes", { hint: "Lets emotes stack on top of the one before them" }),
                        row("emoteScale", "Emote size"),
                        row("removeSpacesBetweenEmotes", "Remove spaces between emotes"),
                        row("emojiSet", "Emoji style", {
                            options: labels([
                                ["twitter", "Twitter"],
                                ["apple", "Apple"],
                                ["google", "Google"],
                                ["facebook", "Facebook"],
                            ]),
                        }),
                        row("emotesTooltipPreview", "Preview on hover", {
                            options: labels([
                                ["alwaysShow", "Always"],
                                ["showOnShift", "While holding Shift"],
                                ["dontShow", "Never"],
                            ]),
                        }),
                        row("emoteTooltipScale", "Preview size", { relabel: { medium: "Medium" } }),
                        row("emoteCompletionWithColon", "Complete emotes after typing :"),
                        row("useSmartEmoteCompletion", "Smarter completion", { hint: "Experimental" }),
                        row("prefixOnlyEmoteCompletion", "Only match the start of emote names", { hint: "Off: sheffy completes to DatSheffy" }),
                    ),
                ],
            },
            {
                title: "Providers",
                blocks: [
                    {
                        kind: "providers",
                        columns: ["Global", "Channel", "Live updates", "Share activity"],
                        providers: [
                            { name: "BetterTTV", cells: ["enableBTTVGlobalEmotes", "enableBTTVChannelEmotes", "enableBTTVLiveUpdates", "sendBTTVActivity"] },
                            { name: "FrankerFaceZ", cells: ["enableFFZGlobalEmotes", "enableFFZChannelEmotes", null, null] },
                            { name: "7TV", cells: ["enableSevenTVGlobalEmotes", "enableSevenTVChannelEmotes", "enableSevenTVEventAPI", "sendSevenTVActivity"] },
                        ],
                    },
                    rows(row("showUnlistedSevenTVEmotes", "Show unlisted 7TV emotes")),
                ],
            },
            {
                title: "Badges",
                description: "Pick which badge types appear before names.",
                blocks: [
                    {
                        kind: "badges",
                        badges: [
                            { id: "showBadgesGlobalAuthority", label: "Authority" },
                            { id: "showBadgesPredictions", label: "Predictions" },
                            { id: "showBadgesChannelAuthority", label: "Channel" },
                            { id: "showBadgesSubscription", label: "Subscriber" },
                            { id: "showBadgesVanity", label: "Vanity" },
                            { id: "showBadgesChatterino", label: "Chatterino" },
                            { id: "showBadgesFfz", label: "FrankerFaceZ" },
                            { id: "showBadgesSevenTV", label: "7TV" },
                            { id: "showBadgesBttv", label: "BetterTTV" },
                        ],
                    },
                    rows(row("useCustomFfzModeratorBadges", "Custom FrankerFaceZ moderator badges"), row("useCustomFfzVipBadges", "Custom FrankerFaceZ VIP badges")),
                ],
            },
        ],
    };
}

function streamerMode(): ModernGeneralPage {
    return {
        name: "Streamer mode",
        description: "Hides personal details while you're live, so nothing slips onto your stream.",
        sections: [
            {
                title: "When to turn on",
                blocks: [
                    rows(
                        row("streamerMode", "Streamer mode", {
                            hint: "Automatic turns on when OBS or similar software is running",
                            segment: true,
                            options: labels([
                                ["off", "Off"],
                                ["auto", "Automatic"],
                                ["on", "Always"],
                            ]),
                        }),
                    ),
                ],
            },
            {
                title: "While it's on",
                blocks: [
                    rows(
                        row("streamerModeHideUsercardAvatars", "Hide avatars in user cards"),
                        row("streamerModeHideLinkThumbnails", "Hide link thumbnails"),
                        row("streamerModeHideViewerCountAndDuration", "Hide viewer count and uptime in the split header"),
                        row("streamerModeHideModActions", "Hide moderation actions"),
                        row("streamerModeHideRestrictedUsers", "Hide messages from restricted users"),
                        row("streamerModeHideBlockedTermText", "Hide blocked terms"),
                        row("streamerModeMuteMentions", "Mute mention sounds"),
                        row("streamerModeSuppressLiveNotifications", "Silence live notifications"),
                        row("streamerModeSuppressInlineWhispers", "Keep whispers out of chat"),
                    ),
                ],
            },
        ],
    };
}

function advanced(): ModernGeneralPage {
    return {
        name: "Advanced",
        description: "Fine-tuning, storage and things that need a restart.",
        sections: [
            {
                title: "Split header",
                blocks: [rows(row("headerUptime", "Uptime"), row("headerViewerCount", "Viewer count"), row("headerGame", "Category"), row("headerStreamTitle", "Stream title"))],
            },
            {
                title: "Similar messages",
                description: "Hides messages that repeat ones you've just seen. Press Ctrl+H in a split to show them again.",
                blocks: [
                    rows(
                        row("similarityEnabled", "Hide similar messages"),
                        row("hideSimilarBySameUser", "Only compare messages from the same user"),
                        row("hideSimilarMyself", "Hide my own messages too"),
                        row("shownSimilarTriggerHighlights", "Play sounds for hidden messages"),
                        row("similarityPercentage", "Similarity threshold", { hint: "1 means identical" }),
                        row("hideSimilarMaxDelay", "Maximum delay between messages"),
                        row("hideSimilarMaxMessagesToCheck", "Messages to compare against"),
                    ),
                ],
            },
            {
                title: "Overlay",
                blocks: [
                    rows(
                        row("overlayScaleFactor", "Zoom", { options: ZOOM_OPTIONS }),
                        row("overlayBackgroundOpacity", "Background opacity", { unit: "of 255" }),
                        row("enableOverlayShadow", "Text shadow"),
                        row("overlayShadowOpacity", "Shadow opacity", { unit: "of 255" }),
                        row("overlayShadowColor", "Shadow colour"),
                        row("overlayShadowRadius", "Shadow blur", { unit: "dp" }),
                        row("overlayShadowOffsetX", "Shadow offset x", { unit: "dp" }),
                        row("overlayShadowOffsetY", "Shadow offset y", { unit: "dp" }),
                    ),
                ],
            },
            {
                title: "Search from the context menu",
                description: "Select text in a message, right-click, and search it with the engine below.",
                blocks: [
                    rows(
                        row("searchEnabled", "Search selected text"),
                        row("searchPreset", "Search engine", { placeholder: "Choose one" }),
                        row("searchEngineUrl", "Search URL", { hint: "The selected text goes at the end", placeholder: "https://example.com/search?q=", wide: true }),
                        row("searchEngineName", "Engine name", { placeholder: "Shown in the menu" }),
                    ),
                ],
            },
            {
                title: "Storage",
                blocks: [
                    rows(
                        row("appdata-buttons", "App data", { hint: "Settings, logs and accounts", buttonLabels: { "open-appdata": "Open folder" } }),
                        row("cache-buttons", "Cache", {
                            hint: "Emotes and images saved to load faster and use less data",
                            buttonLabels: { "cache-choose": "Change", "cache-reset": "Reset", "cache-clear": "Clear cache" },
                            pathValue: (access) => access.settings.cachePath || "Default location",
                        }),
                        row("useKeyring", "Keep passwords in the system keychain"),
                    ),
                ],
            },
            {
                title: "Chatterino",
                blocks: [rows(row("syncChatterinoSettings", "Sync settings with Chatterino", { hint: "Applies changes made in Chatterino. Nothing is written back" }))],
            },
            {
                title: "Sound",
                blocks: [
                    rows(
                        row("soundBackend", "Sound backend", { hint: RESTART, relabel: { null: "None" } }),
                        row("soundMiniaudioKeepEngineAlive", "Keep the sound backend running", { hint: RESTART }),
                    ),
                ],
            },
            {
                title: "Browser extension",
                description: "Keeps the Watching split in sync with the Twitch tab open in your browser.",
                blocks: [
                    rows(
                        {
                            kind: "links",
                            id: "browser-extension-links",
                            label: "Get the extension",
                            links: [
                                { label: "Chrome", from: "description-chrome" },
                                { label: "Firefox", from: "description-firefox" },
                            ],
                        },
                        row("additionalExtensionIDs", "Extra extension IDs", {
                            hint: "Separate with semicolons. Mixing browsers can cause issues",
                            placeholder: "id-one;id-two",
                            wide: true,
                        }),
                    ),
                ],
            },
            {
                title: "Updates and recovery",
                blocks: [
                    rows(
                        row("betaUpdates", "Get beta updates", { hint: "Earlier builds, possibly less stable" }),
                        row("restartOnCrash", "Restart after a crash", { hint: RESTART }),
                    ),
                ],
            },
            {
                title: "Connection",
                blocks: [rows(row("chatSendProtocol", "Chat send protocol"), row("enableExperimentalEventSub", "Experimental EventSub support", { hint: RESTART }))],
            },
        ],
    };
}

export const MODERN_GENERAL: Record<ModernGeneralPageName, ModernGeneralPage> = {
    Appearance: appearance(),
    Chat: chat(),
    "Emotes and badges": emotes(),
    "Streamer mode": streamerMode(),
    Advanced: advanced(),
};
