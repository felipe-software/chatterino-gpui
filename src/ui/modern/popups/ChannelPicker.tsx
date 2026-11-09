import { View } from "@felipe-software/react-native-gpui";
import type { SpecialKind } from "../../state/specialChannels";
import { Button } from "../controls/Button";
import { DialogFooter } from "../controls/DialogFooter";
import { useDialogFrame } from "../controls/DialogFrameContext";
import { TextField } from "../controls/TextField";
import { MODERN_ICONS } from "../icons";
import { ChannelOptionRow } from "./ChannelOptionRow";

export type ChannelChoice = "channel" | SpecialKind;

type Props = {
    choice: ChannelChoice;
    name: string;
    isSupported: (choice: ChannelChoice) => boolean;
    onChoose: (choice: ChannelChoice) => void;
    onName: (name: string) => void;
    onAccept: () => void;
    onCancel: () => void;
};

type Option = { choice: ChannelChoice; label: string; description: string; icon: string };

const OPTIONS: Option[] = [
    { choice: "channel", label: "Channel", description: "Join a Twitch channel by name", icon: MODERN_ICONS.channel },
    { choice: "whispers", label: "Whispers", description: "All your private messages in one place", icon: MODERN_ICONS.whispers },
    { choice: "mentions", label: "Mentions", description: "Messages that mention you, from every channel", icon: MODERN_ICONS.mentions },
    { choice: "watching", label: "Watching", description: "Follows the stream open in your browser", icon: MODERN_ICONS.watching },
    { choice: "live", label: "Live", description: "Channels you follow as they go live", icon: MODERN_ICONS.live },
    { choice: "automod", label: "AutoMod", description: "Messages held for review in channels you moderate", icon: MODERN_ICONS.automod },
];

const SIDE_PADDING = 10;

export function ChannelPicker({ choice, name, isSupported, onChoose, onName, onAccept, onCancel }: Props) {
    const frame = useDialogFrame();
    const topPadding = frame.decorated ? SIDE_PADDING : 0;
    return (
        <View style={{ flex: 1 }}>
            <View accessibilityRole="radiogroup" style={{ flex: 1, gap: 2, paddingTop: topPadding, paddingHorizontal: SIDE_PADDING, paddingBottom: SIDE_PADDING }}>
                {OPTIONS.map((option) => {
                    const selected = choice === option.choice;
                    const showField = selected && option.choice === "channel";
                    return (
                        <ChannelOptionRow
                            key={option.choice}
                            testID={`select-channel-${option.choice}`}
                            label={option.label}
                            description={option.description}
                            icon={option.icon}
                            selected={selected}
                            disabled={!isSupported(option.choice)}
                            onSelect={() => onChoose(option.choice)}
                        >
                            {showField ? (
                                <TextField
                                    testID="select-channel-name"
                                    value={name}
                                    prefix="twitch.tv/"
                                    placeholder="channel"
                                    accessibilityLabel="Channel name"
                                    autoFocus
                                    onChange={onName}
                                    onSubmit={onAccept}
                                />
                            ) : null}
                        </ChannelOptionRow>
                    );
                })}
            </View>
            <DialogFooter>
                <Button testID="select-channel-cancel" label="Cancel" onPress={onCancel} />
                <Button testID="select-channel-ok" label="Open" variant="primary" onPress={onAccept} />
            </DialogFooter>
        </View>
    );
}
