import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";
import { previewNames } from "./previewColors";
import { ThemePreviewLine } from "./ThemePreviewLine";

export function ThemePreview() {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const names = previewNames(tokens);
    return (
        <View testID="settings-theme-preview" style={{ gap: 6 }}>
            <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16, fontWeight: "600" }}>Preview</Text>
            <View style={{ paddingVertical: 8, backgroundColor: tokens.bgChat, borderWidth: 1, borderColor: tokens.lineSubtle, borderRadius: 10 }}>
                <ThemePreviewLine time="20:36" badge="Subscriber" name="orbitkit" nameColor={names.orbit}>
                    {" that waterfall skip was so clean"}
                </ThemePreviewLine>
                <ThemePreviewLine time="20:43" badge="VIP" name="brisk_otter" nameColor={names.brisk} highlighted>
                    {" "}
                    <Text style={{ fontWeight: "700" }}>@nightcoder</Text>
                    {" did you try the other route?"}
                </ThemePreviewLine>
                <ThemePreviewLine time="20:44" badge="Broadcaster" name="lumenplays" nameColor={names.lumen}>
                    {" VOD is up "}
                    <Text style={{ color: tokens.accent }}>f.feridinha.com/8gxpl.mp4</Text>
                </ThemePreviewLine>
            </View>
        </View>
    );
}
