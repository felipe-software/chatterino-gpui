import { forwardRef, useState } from "react";
import { Svg, TextInput, View, type TextInputHandle } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { inputRegistry } from "../../state/inputs";
import { CONTROL_ICONS } from "../controls/icons";
import { IconButton } from "../controls/IconButton";
import { useModernTokens } from "../controls/useModernTokens";
import { MODERN_ICONS } from "../icons";

type Props = { testID: string; value: string; showClose: boolean; onChange: (value: string) => void; onClose: () => void };

const HEIGHT = 34;

export const EmoteSearchBar = forwardRef<TextInputHandle, Props>(function EmoteSearchBar({ testID, value, showClose, onChange, onClose }, ref) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const [focused, setFocused] = useState(false);
    return (
        <View
            style={{
                height: HEIGHT,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingLeft: 10,
                paddingRight: showClose ? 2 : 10,
                backgroundColor: tokens.bgInput,
                borderBottomWidth: 1,
                borderBottomColor: focused ? tokens.accent : tokens.lineStrong,
            }}
        >
            <Svg name={CONTROL_ICONS.search} style={{ width: 15, height: 15, color: tokens.text3 }} />
            <View style={{ flex: 1, minWidth: 0, height: HEIGHT - 1, justifyContent: "center" }}>
                <TextInput
                    ref={ref}
                    testID={testID}
                    accessibilityLabel="Search emotes"
                    value={value}
                    placeholder="Search emotes"
                    placeholderTextColor={tokens.text3}
                    autoFocus
                    onChangeText={onChange}
                    onFocus={() => {
                        setFocused(true);
                        inputRegistry.setFocused(`field:${testID}`);
                    }}
                    onBlur={() => {
                        setFocused(false);
                        inputRegistry.blurred(`field:${testID}`);
                    }}
                    style={{ height: HEIGHT - 1, color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 13 }}
                />
            </View>
            {showClose ? <IconButton testID="emote-popup-close" icon={MODERN_ICONS.close} label="Close" size={28} iconSize={15} onPress={onClose} /> : null}
        </View>
    );
});
