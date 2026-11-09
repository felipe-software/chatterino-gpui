import { useState } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import type { HotkeyOverride } from "../../../data/api";
import { DEFAULT_HOTKEYS, HOTKEY_CATEGORIES, hotkeyKeyParts, hotkeyTitle, type HotkeyCategory, type HotkeyEntry } from "../../settings/hotkeyCatalog";
import { SComboBox } from "../../settings/SComboBox";
import { useApp } from "../../state/AppContext";
import { Button } from "../controls/Button";
import { DialogFooter } from "../controls/DialogFooter";
import { Field } from "../controls/Field";
import { Kbd } from "../controls/Kbd";
import { TextField } from "../controls/TextField";
import { useModernTokens } from "../controls/useModernTokens";

type Props = { entry?: HotkeyEntry; onAccept: (override: HotkeyOverride) => void; onCancel: () => void };

function actionsFor(category: HotkeyCategory) {
    return DEFAULT_HOTKEYS.filter((entry) => entry.category === category && entry.action).map((entry) => ({
        value: entry.action as string,
        label: hotkeyTitle(entry.name),
    }));
}

export function HotkeyEditor({ entry, onAccept, onCancel }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const [name, setName] = useState("");
    const [category, setCategory] = useState<HotkeyCategory>("Window");
    const [action, setAction] = useState(actionsFor("Window")[0]?.value ?? "");
    const [key, setKey] = useState(entry?.key ?? "");
    const keys = hotkeyKeyParts(key.trim());
    const hasKey = key.trim().length > 0;
    const valid = entry ? hasKey : name.trim().length > 0 && hasKey && !!action;

    const save = () => {
        if (!valid) return;
        if (entry) onAccept({ id: entry.name, key: key.trim(), action: entry.action, category: entry.category });
        else onAccept({ id: name.trim(), key: key.trim(), action, category });
    };
    const remove = () => {
        if (entry) onAccept({ id: entry.name, key: entry.key, removed: true, action: entry.action, category: entry.category });
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1, gap: 14, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 20 }}>
                {entry ? (
                    <View style={{ gap: 2 }}>
                        <Text style={{ color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 14, lineHeight: 20, fontWeight: "600" }}>
                            {hotkeyTitle(entry.name)}
                        </Text>
                        <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>{entry.category}</Text>
                    </View>
                ) : (
                    <>
                        <Field label="Name">
                            <TextField testID="hotkey-name" value={name} placeholder="What this shortcut does" autoFocus onChange={setName} />
                        </Field>
                        <View style={{ flexDirection: "row", gap: 12 }}>
                            <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
                                <Field label="Category">
                                    <SComboBox
                                        testID="hotkey-category"
                                        value={category}
                                        options={HOTKEY_CATEGORIES.map((value) => ({ value, label: value }))}
                                        grow
                                        greyable={false}
                                        onChange={(value) => {
                                            const next = value as HotkeyCategory;
                                            setCategory(next);
                                            setAction(actionsFor(next)[0]?.value ?? "");
                                        }}
                                    />
                                </Field>
                            </View>
                            <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
                                <Field label="Action">
                                    <SComboBox
                                        testID="hotkey-action"
                                        value={action}
                                        options={actionsFor(category)}
                                        grow
                                        greyable={false}
                                        onChange={setAction}
                                    />
                                </Field>
                            </View>
                        </View>
                    </>
                )}
                <Field label="Shortcut" hint="Keys joined with +, like Ctrl+Shift+X">
                    <TextField testID="hotkey-key" value={key} placeholder="Ctrl+Shift+X" autoFocus={!!entry} onChange={setKey} onSubmit={save} />
                </Field>
                {keys.length > 0 ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        {keys.map((part, index) => (
                            <Kbd key={`${part}-${index}`} label={part} />
                        ))}
                    </View>
                ) : null}
            </View>
            <DialogFooter>
                {entry ? <Button testID="hotkey-remove" label="Remove" variant="danger" onPress={remove} /> : null}
                <Button testID="hotkey-cancel" label="Cancel" onPress={onCancel} />
                <Button testID="hotkey-ok" label={entry ? "Save" : "Add hotkey"} variant="primary" disabled={!valid} onPress={save} />
            </DialogFooter>
        </View>
    );
}
