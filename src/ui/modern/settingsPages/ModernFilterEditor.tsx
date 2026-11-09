import { useState } from "react";
import { ScrollView, Text, View } from "@felipe-software/react-native-gpui";
import { checkFilterText } from "../../../data/filters/lang/filter";
import { buildFilterText, FILTER_OPERATORS, type FilterOperand } from "../../../data/filters/records";
import { SComboBox } from "../../settings/SComboBox";
import { useApp } from "../../state/AppContext";
import { Button } from "../controls/Button";
import { DialogFooter } from "../controls/DialogFooter";
import { Field } from "../controls/Field";
import { Link } from "../controls/Link";
import { TextField } from "../controls/TextField";
import { MONO_FONT } from "../controls/typography";
import { useModernTokens } from "../controls/useModernTokens";
import { FilterOperandFields } from "./FilterOperandFields";
import { FilterStatus } from "./FilterStatus";

type Props = { onAccept: (name: string, filter: string) => void; onCancel: () => void };

const NOTHING = "nothing";
const OPERATOR_OPTIONS = FILTER_OPERATORS.map((entry) => ({ value: entry.op || NOTHING, label: entry.label }));
const VARIABLES_URL = "https://wiki.chatterino.com/Filters/#variables";

export function ModernFilterEditor({ onAccept, onCancel }: Props) {
    const { fonts, openUrl } = useApp();
    const tokens = useModernTokens();
    const [name, setName] = useState("My filter");
    const [left, setLeft] = useState<FilterOperand>({ type: "variable", value: "message.content" });
    const [op, setOp] = useState("contains");
    const [right, setRight] = useState<FilterOperand>({ type: "text", value: "hello" });
    const noRight = op === NOTHING;
    const expression = buildFilterText(left, noRight ? "" : op, right);
    const check = checkFilterText(expression);
    const accept = () => onAccept(name, expression);
    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
                <View style={{ gap: 14, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 20 }}>
                    <Field label="Name">
                        <TextField testID="filter-name" value={name} placeholder="Filter name" onChange={setName} />
                    </Field>
                    <Field label="Show messages where">
                        <View style={{ gap: 8 }}>
                            <FilterOperandFields testID="filter-left" operand={left} onChange={setLeft} />
                            <SComboBox testID="filter-operator" value={op} options={OPERATOR_OPTIONS} width={160} greyable={false} onChange={setOp} />
                            <FilterOperandFields testID="filter-right" operand={right} disabled={noRight} onChange={setRight} />
                        </View>
                    </Field>
                    <Field label="Expression">
                        <View style={{ gap: 6 }}>
                            <View
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 10,
                                    borderRadius: 6,
                                    borderWidth: 1,
                                    borderColor: tokens.lineSubtle,
                                    backgroundColor: tokens.bgChat,
                                }}
                            >
                                <Text testID="filter-expression" style={{ color: tokens.text2, fontFamily: MONO_FONT, fontSize: 12, lineHeight: 18 }}>
                                    {expression}
                                </Text>
                            </View>
                            <FilterStatus testID="filter-expression-status" check={check} />
                        </View>
                    </Field>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 13, lineHeight: 18 }}>Not sure what to pick?</Text>
                        <Link testID="filter-variable-help" label="Filter variables" onPress={() => openUrl(VARIABLES_URL)} />
                    </View>
                </View>
            </ScrollView>
            <DialogFooter>
                <Button testID="filter-cancel" label="Cancel" onPress={onCancel} />
                <Button testID="filter-ok" label="Add filter" variant="primary" disabled={name.trim().length === 0} onPress={accept} />
            </DialogFooter>
        </View>
    );
}
