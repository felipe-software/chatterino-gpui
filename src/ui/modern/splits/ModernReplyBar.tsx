import { Svg, Text } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import type { ReplyTarget } from "../../splits/replyTarget";
import { FadeIn } from "../controls/FadeIn";
import { IconButton } from "../controls/IconButton";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_ICONS } from "../icons";

type Props = { splitId: string; target: ReplyTarget; onCancel: () => void };

export function ModernReplyBar({ splitId, target, onCancel }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const text = { fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 16 };
    return (
        <FadeIn
            testID={`reply-bar-${splitId}`}
            style={{
                height: 34,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingLeft: 10,
                paddingRight: 4,
                borderWidth: 1,
                borderColor: tokens.lineSubtle,
                borderRadius: 8,
                backgroundColor: tokens.bgRaised,
            }}
        >
            <Svg name={MODERN_ICONS.reply} style={{ width: 15, height: 15, color: tokens.text3 }} />
            <Text testID={`reply-label-${splitId}`} numberOfLines={1} style={{ ...text, flexShrink: 0, color: tokens.text2 }}>
                Replying to
                <Text style={{ color: tokens.text, fontWeight: "600" }}>{` @${target.displayName}`}</Text>
            </Text>
            <Text testID={`reply-preview-${splitId}`} numberOfLines={1} style={{ ...text, flex: 1, minWidth: 0, color: tokens.text3 }}>
                {target.text}
            </Text>
            <IconButton testID={`reply-cancel-${splitId}`} icon={MODERN_ICONS.close} label="Cancel reply" size={26} iconSize={14} tone="muted" onPress={onCancel} />
        </FadeIn>
    );
}
