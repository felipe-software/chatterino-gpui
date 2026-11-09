import { useState } from "react";
import { View } from "@felipe-software/react-native-gpui";
import type { ChannelInfo } from "../../../data/api";
import { useStore } from "../../state/useStore";
import { useApp } from "../../state/AppContext";
import { Button } from "../controls/Button";
import { EmptyState } from "../controls/EmptyState";
import { TextField } from "../controls/TextField";
import { useModernTokens } from "../controls/useModernTokens";
import { SettingsCard } from "../settings/SettingsCard";
import { LiveChannelRow } from "./LiveChannelRow";
import { useNow } from "./useNow";

type Props = {
    testID: string;
    channels: string[];
    onChange: (channels: string[]) => void;
    showStatus: boolean;
    emptyTitle: string;
    emptyDescription: string;
    emptyIcon: string;
};

const TWITCH_NAME = /^[a-z0-9_]{1,25}$/;

function liveOf(infos: Record<string, ChannelInfo>, name: string) {
    return infos[name]?.live;
}

export function ChannelListEditor({ testID, channels, onChange, showStatus, emptyTitle, emptyDescription, emptyIcon }: Props) {
    const { channelInfos } = useApp();
    const tokens = useModernTokens();
    const infos = useStore(channelInfos);
    const [draft, setDraft] = useState("");
    const anyLive = showStatus && channels.some((channel) => liveOf(infos, channel)?.live);
    const now = useNow(anyLive);
    const candidate = draft.trim().toLowerCase();
    const canAdd = TWITCH_NAME.test(candidate) && !channels.includes(candidate);
    const add = () => {
        if (!canAdd) return;
        onChange([...channels, candidate]);
        setDraft("");
    };
    return (
        <>
            <View style={{ flexDirection: "row", gap: 8 }}>
                <TextField
                    testID={`${testID}-input`}
                    size="md"
                    height={36}
                    prefix="twitch.tv/"
                    placeholder="channel"
                    value={draft}
                    grow
                    onChange={setDraft}
                    onSubmit={add}
                />
                <Button testID={`${testID}-add`} label="Add" disabled={!canAdd} onPress={add} />
            </View>
            {channels.length === 0 ? (
                <EmptyState bordered icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
            ) : (
                <SettingsCard tokens={tokens}>
                    {channels.map((name, index) => (
                        <LiveChannelRow
                            key={name}
                            testID={`${testID}-${name}`}
                            name={name}
                            status={showStatus ? liveOf(infos, name) : undefined}
                            now={now}
                            first={index === 0}
                            onRemove={() => onChange(channels.filter((channel) => channel !== name))}
                        />
                    ))}
                </SettingsCard>
            )}
        </>
    );
}
