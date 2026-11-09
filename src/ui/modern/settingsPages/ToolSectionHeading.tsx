import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { Link } from "../controls/Link";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { title: string; description?: string; links: Array<{ label: string; url: string }> };

export function ToolSectionHeading({ title, description, links }: Props) {
    const { fonts, openUrl } = useApp();
    const tokens = useModernTokens();
    return (
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, gap: 4 }}>
                <Text style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 15, lineHeight: 20, fontWeight: "600" }}>{title}</Text>
                {description ? <Text style={{ color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 }}>{description}</Text> : null}
            </View>
            {links.length > 0 ? (
                <View style={{ flexDirection: "row", gap: 12, paddingTop: 2 }}>
                    {links.map((link) => (
                        <Link key={link.label} testID={`tool-link-${link.label.toLowerCase()}`} label={link.label} onPress={() => openUrl(link.url)} />
                    ))}
                </View>
            ) : null}
        </View>
    );
}
