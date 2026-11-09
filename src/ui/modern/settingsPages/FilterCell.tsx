import { View } from "@felipe-software/react-native-gpui";
import type { FilterCheck } from "../../../data/api";
import { EditableText } from "./EditableText";
import { FilterStatus } from "./FilterStatus";

type Props = {
    testID: string;
    filter: string;
    check: FilterCheck;
    onCommit: (filter: string) => void;
    onShowErrors: () => void;
};

export function FilterCell({ testID, filter, check, onCommit, onShowErrors }: Props) {
    return (
        <View style={{ gap: 4 }}>
            <EditableText testID={`${testID}-text`} value={filter} monospace multiline onCommit={onCommit} />
            <FilterStatus testID={`${testID}-status`} check={check} onShowErrors={onShowErrors} />
        </View>
    );
}
