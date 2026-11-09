import type { ChatListScrollState } from "../../../native/chatList";
import { Button } from "../controls/Button";
import { FadeIn } from "../controls/FadeIn";
import { MODERN_ICONS } from "../icons";

type Props = { scroll: ChatListScrollState; testID: string; onPress: () => void };

function newMessagesText(count: number): string {
    return count === 1 ? "1 new message" : `${count} new messages`;
}

export function pillLabel(scroll: ChatListScrollState): string {
    if (!scroll.paused) return "Jump to latest";
    if (scroll.unseen > 0) return `Paused · ${newMessagesText(scroll.unseen)}`;
    return "Paused";
}

export function JumpPill({ scroll, testID, onPress }: Props) {
    return (
        <FadeIn style={{ position: "absolute", left: 0, right: 0, bottom: 14, alignItems: "center" }}>
            <Button testID={testID} shape="pill" variant="primary" label={pillLabel(scroll)} icon={MODERN_ICONS.arrowDown} onPress={onPress} />
        </FadeIn>
    );
}
