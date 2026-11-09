import { useState } from "react";
import { Linking, Text, View } from "@felipe-software/react-native-gpui";
import { LOGIN_URL, parseLoginInfo } from "../../data/accounts";
import type { LoginCredentials } from "../../data/api";
import { Button } from "../modern/controls/Button";
import { Callout } from "../modern/controls/Callout";
import { Divider } from "../modern/controls/Divider";
import { Link } from "../modern/controls/Link";
import { TextField as ModernTextField } from "../modern/controls/TextField";
import { MODERN_ICONS } from "../modern/icons";
import { LoginStep } from "../modern/popups/LoginStep";
import { RichText } from "../settings/RichText";
import { SETTINGS_STYLE } from "../settings/settingsStyle";
import { SLineEdit } from "../settings/SLineEdit";
import { SPushButton } from "../settings/SPushButton";
import { useApp } from "../state/AppContext";

type Props = { onCredentials: (credentials: LoginCredentials) => void };

const BROWSER_ERROR = `An error occurred while attempting to open the log in link (${LOGIN_URL}) - open it manually in your browser and proceed from there.`;

const STEPS = ["Twitch opens in your browser", "Approve Chatterino", "Copy your login info, then paste it here"];

export function LoginBasicTab({ onCredentials }: Props) {
    const { core, openUrl, theme, fonts } = useApp();
    const tokens = theme.modern;
    const [browserFailed, setBrowserFailed] = useState(false);
    const [manual, setManual] = useState(false);
    const [pasted, setPasted] = useState("");

    const openLogin = () => {
        Linking.openURL(LOGIN_URL).catch(() => setBrowserFailed(true));
    };

    const paste = () => {
        const reading = core.readClipboard();
        if (!reading) {
            setManual(true);
            return;
        }
        reading.then(
            (text) => {
                core.clearClipboard();
                onCredentials(parseLoginInfo(text));
            },
            () => setManual(true),
        );
    };

    const submitPasted = () => {
        const credentials = parseLoginInfo(pasted.trim());
        setPasted("");
        onCredentials(credentials);
    };

    if (tokens) {
        const caption = { color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 };
        return (
            <View testID="login-basic" style={{ flex: 1, gap: 18, paddingTop: 18, paddingHorizontal: 20, paddingBottom: 20 }}>
                <View style={{ gap: 12 }}>
                    {STEPS.map((step, index) => (
                        <LoginStep key={step} number={index + 1} text={step} />
                    ))}
                </View>
                <View style={{ flexDirection: "row" }}>
                    <Button
                        testID="login-browser"
                        label="Log in with Twitch"
                        variant="primary"
                        size="lg"
                        icon={MODERN_ICONS.externalLink}
                        iconPosition="end"
                        grow
                        onPress={openLogin}
                    />
                </View>
                {browserFailed ? (
                    <View testID="login-browser-error" style={{ gap: 6 }}>
                        <Callout tone="warning" title="Couldn't open your browser" description="Open this link yourself, then paste the login info here." />
                        <Link label={LOGIN_URL} size={12} onPress={() => openUrl(LOGIN_URL)} />
                    </View>
                ) : null}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <Divider />
                    </View>
                    <Text style={caption}>or</Text>
                    <View style={{ flex: 1 }}>
                        <Divider />
                    </View>
                </View>
                <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: "row" }}>
                        <Button testID="login-paste" label="Paste login info" size="lg" icon={MODERN_ICONS.clipboard} grow onPress={paste} />
                    </View>
                    <View style={{ alignItems: "center" }}>
                        <Text style={{ ...caption, textAlign: "center" }}>Copied your login info from the browser page? Paste it here.</Text>
                    </View>
                </View>
                {manual ? (
                    <View style={{ gap: 8 }}>
                        <ModernTextField
                            testID="login-paste-field"
                            value={pasted}
                            placeholder="Paste the login info here"
                            secure
                            autoFocus
                            onChange={setPasted}
                            onSubmit={submitPasted}
                        />
                        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                            <Button testID="login-paste-submit" label="Add account" variant="primary" disabled={!pasted.trim()} onPress={submitPasted} />
                        </View>
                    </View>
                ) : null}
            </View>
        );
    }

    return (
        <View testID="login-basic" style={{ flex: 1, justifyContent: "center", gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
                <SPushButton testID="login-browser" label="Log in (Opens in browser)" primary onPress={openLogin} />
                <SPushButton testID="login-paste" label="Paste login info" onPress={paste} />
            </View>
            {manual ? (
                <View style={{ gap: 4 }}>
                    <SLineEdit
                        testID="login-paste-field"
                        value={pasted}
                        placeholder="Paste the login info here"
                        secure
                        autoFocus
                        onChange={setPasted}
                        onSubmit={submitPasted}
                    />
                    <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                        <SPushButton testID="login-paste-submit" label="Add user" disabled={!pasted.trim()} onPress={submitPasted} />
                    </View>
                </View>
            ) : null}
            {browserFailed ? (
                <RichText
                    testID="login-browser-error"
                    text={BROWSER_ERROR}
                    links={[{ label: `the log in link (${LOGIN_URL})`, url: LOGIN_URL }]}
                    color={SETTINGS_STYLE.text}
                    onOpen={openUrl}
                />
            ) : null}
        </View>
    );
}
