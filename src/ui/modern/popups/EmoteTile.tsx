import { Image, View, type MouseResponderEvent } from "@felipe-software/react-native-gpui";
import type { EmoteInfo } from "../../../data/api";
import { HoverLayer } from "../controls/HoverLayer";
import { usePressState } from "../controls/usePressState";
import { fitEmote } from "./emoteImage";

type Props = {
    emote: EmoteInfo;
    x: number;
    size: number;
    selected: boolean;
    onHover: (emote: EmoteInfo) => void;
    onPick: (emote: EmoteInfo, keepOpen: boolean) => void;
};

const IMAGE_BOX = 32;
const IMAGE_INSET = 8;
const RADIUS = 6;

export function EmoteTile({ emote, x, size, selected, onHover, onPick }: Props) {
    const press = usePressState();
    const image = fitEmote(emote, Math.min(IMAGE_BOX, size - IMAGE_INSET));
    const pick = (event: MouseResponderEvent) => onPick(emote, !!event.nativeEvent.shiftKey);
    return (
        <View
            testID={`emote-cell-${emote.name}`}
            accessibilityRole="button"
            accessibilityLabel={emote.name}
            accessibilityState={{ selected }}
            nativeListGroup="emote-grid"
            style={{
                position: "absolute",
                left: x,
                top: 0,
                width: size,
                height: size,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: RADIUS,
                cursor: "pointer",
            }}
            {...press.handlers}
            onMouseEnter={() => {
                press.handlers.onMouseEnter();
                onHover(emote);
            }}
            onClick={pick}
        >
            <HoverLayer hovered={press.hovered || selected} pressed={press.pressed} radius={RADIUS} />
            <Image source={{ uri: emote.url }} style={{ width: image.width, height: image.height }} resizeMode="contain" />
        </View>
    );
}
