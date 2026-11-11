import { View } from "@felipe-software/react-native-gpui";
import type { ChatListMessage } from "../../../native/chatList";
import type { Channel, LiveStatus, UserInfo } from "../../../data/api";
import { localizeNumber } from "../../format";
import { useApp } from "../../state/AppContext";
import { inputRegistry } from "../../state/inputs";
import { useModRights } from "../../state/useChannelRights";
import { useStore } from "../../state/useStore";
import { Button } from "../controls/Button";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_ICONS } from "../icons";
import { readableNameColor } from "../splits/readableColor";
import { RecentMessages } from "./RecentMessages";
import { TimeoutBar } from "./TimeoutBar";
import { authorLook, monthYear, sinceYear, splitForChannel } from "./userCardData";
import { UserCardHeader } from "./UserCardHeader";
import { UserCardToggle } from "./UserCardToggle";
import { UserStat } from "./UserStat";

type Subscribe = (append: (messages: ChatListMessage[]) => void) => () => void;

type Props = {
    login: string;
    channel: string;
    isTwitchChannel: boolean;
    info?: UserInfo;
    failed: boolean;
    live?: LiveStatus;
    source?: Channel;
    messages: ChatListMessage[];
    subscribe: Subscribe;
    pinned: boolean;
    blocked: boolean;
    loggedIn: boolean;
    onPin: () => void;
    onBlock: (blocked: boolean) => void;
    onClose: () => void;
};

const PENDING = "…";
const UNKNOWN = "—";

function idTextOf(info: UserInfo | undefined, failed: boolean): string {
    if (info?.id) return `ID ${info.id}`;
    return failed ? "ID not available" : `ID ${PENDING}`;
}

function followsTextOf(info: UserInfo | undefined, missing: string): string {
    if (info?.followedAt !== undefined) return sinceYear(info.followedAt);
    return info ? UNKNOWN : missing;
}

export function UserCardBody(props: Props) {
    const { login, channel, isTwitchChannel, info, failed, live, source, messages, subscribe, pinned, blocked, loggedIn, onPin, onBlock, onClose } = props;
    const { core, settings, openUrl } = useApp();
    const tokens = useModernTokens();
    const accounts = useStore(core.accounts);
    const isModerator = useModRights(source, accounts.current);
    const look = authorLook(messages);
    const displayName = info?.displayName ?? login;
    const rawColor = info?.color ?? look.color;
    const nameColor = rawColor ? readableNameColor(rawColor, tokens.scheme) : tokens.text;
    const missing = failed ? UNKNOWN : PENDING;
    const localizedLogin = info && info.displayName.toLowerCase() !== info.login ? info.login : undefined;
    const idLabel = idTextOf(info, failed);
    const idText = localizedLogin ? `${localizedLogin} · ${idLabel}` : idLabel;
    const followers = info?.followers === undefined ? missing : localizeNumber(info.followers);
    const joined = info?.createdAt === undefined ? missing : monthYear(info.createdAt);
    const follows = isTwitchChannel ? followsTextOf(info, missing) : UNKNOWN;
    const liveViewers = live?.live ? live.viewers ?? 0 : undefined;
    const splitId = isTwitchChannel ? splitForChannel(core.layout.get(), channel) : undefined;
    const hasInput = !!splitId && !!inputRegistry.get(splitId);
    const mentionName = displayName.toLowerCase() === login ? displayName : login;
    const canModerate = isTwitchChannel && isModerator;

    const finish = () => {
        if (!pinned) onClose();
    };
    const mention = () => {
        if (!splitId) return;
        inputRegistry.get(splitId)?.mention(mentionName, false);
        finish();
    };
    const whisper = () => {
        const input = splitId ? inputRegistry.get(splitId) : undefined;
        if (!input) return;
        input.insert(`/w ${login} `);
        input.focus();
        finish();
    };
    const timeout = (seconds: number) => {
        source?.send(`/timeout ${login} ${seconds}`);
    };
    const ban = () => {
        source?.send(`/ban ${login}`);
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ paddingTop: 10, paddingRight: 6, paddingBottom: 10, paddingLeft: 12 }}>
                <UserCardHeader
                    displayName={displayName}
                    color={nameColor}
                    avatarUrl={info?.avatarUrl}
                    idText={idText}
                    id={info?.id}
                    badges={look.badges}
                    liveViewers={liveViewers}
                    pinned={pinned}
                    onPin={onPin}
                    onClose={onClose}
                    onProfile={() => openUrl(`https://www.twitch.tv/${login}`)}
                />
            </View>
            <View style={{ flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, borderColor: tokens.lineSubtle }}>
                <UserStat testID="user-card-followers" label="Followers" value={followers} />
                <UserStat testID="user-card-created" label="Account created" value={joined} divided />
                <UserStat testID="user-card-follows" label="Following since" value={follows} divided />
            </View>
            <View style={{ gap: 8, paddingVertical: 10, paddingHorizontal: 12 }}>
                <View style={{ flexDirection: "row", gap: 6 }}>
                    <Button testID="user-card-mention" label="Mention" icon={MODERN_ICONS.mentions} size="sm" grow disabled={!hasInput} onPress={mention} />
                    <Button testID="user-card-whisper" label="Whisper" icon={MODERN_ICONS.chat} size="sm" grow disabled={!hasInput} onPress={whisper} />
                    <Button
                        testID="user-card-usercard"
                        label="Card"
                        icon={MODERN_ICONS.account}
                        size="sm"
                        grow
                        disabled={!isTwitchChannel}
                        onPress={() => openUrl(`https://www.twitch.tv/popout/${channel}/viewercard/${login}`)}
                    />
                    <Button testID="user-card-profile" label="Profile" icon={MODERN_ICONS.externalLink} size="sm" grow onPress={() => openUrl(`https://www.twitch.tv/${login}`)} />
                </View>
                {canModerate ? <TimeoutBar buttons={settings.timeoutButtons} onTimeout={timeout} onBan={ban} /> : null}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                    <UserCardToggle testID="user-card-block" label="Block" value={blocked} onChange={onBlock} />
                    <UserCardToggle testID="user-card-ignore-highlights" label="Ignore highlights" value={false} disabled={!loggedIn} onChange={() => undefined} />
                </View>
            </View>
            <RecentMessages
                title={isTwitchChannel ? `Messages in #${channel}` : "Messages"}
                messages={messages}
                subscribe={subscribe}
                showList={!!source}
            />
        </View>
    );
}
