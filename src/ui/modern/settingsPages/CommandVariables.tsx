import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { Code } from "../controls/Code";
import { Link } from "../controls/Link";
import { useModernTokens } from "../controls/useModernTokens";
import { SettingsSection } from "../settings/SettingsSection";

const VARIABLES = [
    { code: "{1}", text: "The first word after the trigger" },
    { code: "{1+}", text: "The first word and everything after it" },
    { code: "{{", text: "A literal opening brace" },
];

const HELP_URL = "https://chatterino.com/help/commands";

export function CommandVariables() {
    const { fonts, openUrl } = useApp();
    const tokens = useModernTokens();
    return (
        <SettingsSection tokens={tokens} title="Variables">
            <View style={{ flexDirection: "row", gap: 8 }}>
                {VARIABLES.map((variable) => (
                    <View
                        key={variable.code}
                        style={{
                            flexGrow: 1,
                            flexShrink: 1,
                            flexBasis: 0,
                            minWidth: 0,
                            gap: 6,
                            paddingVertical: 12,
                            paddingHorizontal: 14,
                            backgroundColor: tokens.bgRaised,
                            borderWidth: 1,
                            borderColor: tokens.lineSubtle,
                            borderRadius: 8,
                        }}
                    >
                        <Code text={variable.code} />
                        <Text style={{ color: tokens.text2, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18, minWidth: 0 }}>{variable.text}</Text>
                    </View>
                ))}
            </View>
            <View style={{ alignSelf: "flex-start" }}>
                <Link testID="commands-help" label="All variables and examples" onPress={() => openUrl(HELP_URL)} />
            </View>
        </SettingsSection>
    );
}
