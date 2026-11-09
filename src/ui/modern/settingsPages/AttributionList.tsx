import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { Link } from "../controls/Link";
import { useModernTokens } from "../controls/useModernTokens";
import { SettingsCard } from "../settings/SettingsCard";

export type Attribution = { what: string; who: string; url: string };

type Props = { attributions: Attribution[] };

export function AttributionList({ attributions }: Props) {
    const { fonts, openUrl } = useApp();
    const tokens = useModernTokens();
    return (
        <SettingsCard tokens={tokens}>
            {attributions.map((entry, index) => (
                <View
                    key={entry.what}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        minHeight: index === 0 ? 40 : 41,
                        paddingHorizontal: 16,
                        borderTopWidth: index === 0 ? 0 : 1,
                        borderTopColor: tokens.lineSubtle,
                    }}
                >
                    <Text
                        style={{
                            flexGrow: 1,
                            flexShrink: 1,
                            flexBasis: 0,
                            minWidth: 0,
                            color: tokens.text2,
                            fontFamily: fonts.uiFamily,
                            fontSize: 13,
                            lineHeight: 18,
                        }}
                    >
                        {entry.what}
                    </Text>
                    <Link label={entry.who} onPress={() => openUrl(entry.url)} />
                </View>
            ))}
        </SettingsCard>
    );
}
