import { Image, Text, View } from "@felipe-software/react-native-gpui";
import type { EmoteInfo } from "../../../data/api";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";
import { fitEmote } from "./emoteImage";

type Props = { emote?: EmoteInfo; name: string; source: string };

const IMAGE_BOX = 32;
const HINT = "Click to insert\nShift-click to keep open";

export function EmotePreview({ emote, name, source }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const image = emote ? fitEmote(emote, IMAGE_BOX) : undefined;
    const text = { fontFamily: fonts.uiFamily };
    return (
        <View
            testID="emote-preview"
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderTopWidth: 1,
                borderTopColor: tokens.lineSubtle,
                backgroundColor: tokens.bgChat,
            }}
        >
            <View style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: tokens.bgInput }}>
                {emote && image ? <Image source={{ uri: emote.url }} style={{ width: image.width, height: image.height }} resizeMode="contain" /> : null}
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
                <Text numberOfLines={1} style={{ ...text, color: tokens.text, fontSize: 14, lineHeight: 18, fontWeight: "600" }}>
                    {name}
                </Text>
                {source ? <Text style={{ ...text, color: tokens.text3, fontSize: 12, lineHeight: 16 }}>{source}</Text> : null}
            </View>
            <Text style={{ ...text, color: tokens.text3, fontSize: 11, lineHeight: 14, textAlign: "right" }}>{HINT}</Text>
        </View>
    );
}
