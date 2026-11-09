import { View } from "@felipe-software/react-native-gpui";
import { FILTER_VARIABLES, type FilterOperand } from "../../../data/filters/records";
import { SComboBox } from "../../settings/SComboBox";
import { TextField } from "../controls/TextField";

type Props = { testID: string; operand: FilterOperand; disabled?: boolean; onChange: (operand: FilterOperand) => void };

const TYPES = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "variable", label: "Variable" },
];

const VARIABLE_OPTIONS = FILTER_VARIABLES.map((variable) => ({ value: variable.key, label: variable.label }));
const DIGITS = /^\d*$/;

export function FilterOperandFields({ testID, operand, disabled = false, onChange }: Props) {
    const changeType = (type: string) => onChange({ type: type as FilterOperand["type"], value: type === "variable" ? VARIABLE_OPTIONS[0].value : "" });
    const changeValue = (value: string) => {
        const accepted = operand.type !== "number" || DIGITS.test(value);
        if (accepted) onChange({ type: operand.type, value });
    };
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <SComboBox testID={`${testID}-type`} value={operand.type} options={TYPES} width={130} greyable={false} disabled={disabled} onChange={changeType} />
            {operand.type === "variable" ? (
                <SComboBox
                    testID={`${testID}-variable`}
                    value={operand.value}
                    options={VARIABLE_OPTIONS}
                    grow
                    greyable={false}
                    disabled={disabled}
                    onChange={(value) => onChange({ type: "variable", value })}
                />
            ) : (
                <TextField
                    testID={`${testID}-value`}
                    size="md"
                    value={operand.value}
                    placeholder={operand.type === "number" ? "0" : "text"}
                    monospace
                    grow
                    disabled={disabled}
                    onChange={changeValue}
                />
            )}
        </View>
    );
}
