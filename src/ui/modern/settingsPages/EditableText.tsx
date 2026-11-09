import { useState, type ReactNode } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { TextField } from "../controls/TextField";
import { MONO_FONT } from "../controls/typography";
import { useModernTokens } from "../controls/useModernTokens";

type Props = {
    testID: string;
    value: string;
    onCommit: (value: string) => void;
    placeholder?: string;
    monospace?: boolean;
    fontSize?: number;
    weight?: "400" | "500" | "600";
    color?: string;
    autoEdit?: boolean;
    validate?: (value: string) => boolean;
    onDone?: () => void;
    multiline?: boolean;
    display?: ReactNode;
};

export function EditableText({
    testID,
    value,
    onCommit,
    placeholder,
    monospace = false,
    fontSize = 13,
    weight = "400",
    color,
    autoEdit = false,
    validate,
    onDone,
    multiline = false,
    display,
}: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const [draft, setDraft] = useState<string | null>(autoEdit ? value : null);
    const editing = draft !== null;

    const commit = () => {
        if (draft === null) return;
        const accepted = !validate || validate(draft);
        if (accepted && draft !== value) onCommit(draft);
        setDraft(null);
        onDone?.();
    };

    if (editing) {
        return (
            <View style={{ flexDirection: "row", marginLeft: -11 }}>
                <TextField
                    testID={`${testID}-input`}
                    value={draft}
                    onChange={setDraft}
                    size="md"
                    monospace={monospace}
                    autoFocus
                    grow
                    invalid={!!validate && !validate(draft)}
                    placeholder={placeholder}
                    onSubmit={commit}
                    onBlur={commit}
                />
            </View>
        );
    }

    const empty = value.length === 0;
    const shown = empty ? (placeholder ?? "") : value;
    const textColor = empty ? tokens.text3 : (color ?? tokens.text);
    return (
        <View
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${shown}`}
            style={{ alignSelf: display ? "flex-start" : "stretch", justifyContent: "center", minHeight: multiline ? undefined : 28, cursor: "text" }}
            onClick={() => setDraft(value)}
        >
            {display ?? (
                <Text
                    numberOfLines={multiline ? undefined : 1}
                    style={{
                        color: textColor,
                        fontFamily: monospace ? MONO_FONT : fonts.uiFamily,
                        fontSize,
                        lineHeight: fontSize + 7,
                        fontWeight: weight,
                    }}
                >
                    {shown}
                </Text>
            )}
        </View>
    );
}
