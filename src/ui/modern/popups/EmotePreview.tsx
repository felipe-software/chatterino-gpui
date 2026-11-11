import { Image, Text, View } from "@felipe-software/react-native-gpui";
import type { EmoteInfo } from "../../../data/api";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";
import { fitEmote } from "./emoteImage";

type Props = { emote?: EmoteInfo; name: string; source: string };

const IMAGE_BOX = 22;
const HINT = "Shift-click keeps this open";

export function EmotePreview({ emote, name, source }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const image = emote ? fitEmote(emote, IMAGE_BOX) : undefined;
    const text = { fontFamily: fonts.uiFamily, lineHeight: 16 };
    return (
        <View
            testID="emote-preview"
            style={{
                height: 30,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingLeft: 6,
                paddingRight: 10,
                borderTopWidth: 1,
                borderTopColor: tokens.lineSubtle,
                backgroundColor: tokens.bgRaised,
            }}
        >
            <View style={{ width: IMAGE_BOX, height: IMAGE_BOX, alignItems: "center", justifyContent: "center" }}>
                {emote && image ? <Image source={{ uri: emote.url }} style={{ width: image.width, height: image.height }} resizeMode="contain" /> : null}
            </View>
            <Text testID="emote-preview-name" numberOfLines={1} style={{ ...text, flexShrink: 1, color: tokens.text, fontSize: 13, fontWeight: "600" }}>
                {name}
            </Text>
            <Text numberOfLines={1} style={{ ...text, flex: 1, minWidth: 0, color: tokens.text3, fontSize: 12 }}>
                {source}
            </Text>
            <Text numberOfLines={1} style={{ ...text, color: tokens.text3, fontSize: 11 }}>
                {HINT}
            </Text>
        </View>
    );
}
