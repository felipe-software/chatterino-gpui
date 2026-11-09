import { Text, View } from "@felipe-software/react-native-gpui";
import { RichText } from "../../settings/RichText";
import type { DescriptionLink } from "../../settings/generalTypes";
import { useApp } from "../../state/AppContext";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { title: string; description?: string; links?: DescriptionLink[] };

export function SettingsSectionHeading({ title, description, links }: Props) {
    const { fonts, openUrl } = useApp();
    const tokens = useModernTokens();
    return (
        <View style={{ gap: 4 }}>
            <Text style={{ fontFamily: fonts.uiFamily, fontSize: 15, lineHeight: 20, fontWeight: "600", color: tokens.text }}>{title}</Text>
            {description ? (
                <RichText text={description} links={links} color={tokens.text2} linkColor={tokens.accent} fontSize={13} lineHeight={18} padding={0} onOpen={openUrl} />
            ) : null}
        </View>
    );
}
