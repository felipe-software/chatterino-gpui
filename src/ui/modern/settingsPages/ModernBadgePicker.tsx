import { useState } from "react";
import { ScrollView, View } from "@felipe-software/react-native-gpui";
import { AVAILABLE_BADGES } from "../../settings/highlightRows";
import { Button } from "../controls/Button";
import { DialogFooter } from "../controls/DialogFooter";
import { OptionRow } from "./OptionRow";

type Badge = (typeof AVAILABLE_BADGES)[number];

type Props = { onPick: (badge: Badge) => void; onCancel: () => void };

export function ModernBadgePicker({ onPick, onCancel }: Props) {
    const [selected, setSelected] = useState<Badge>(AVAILABLE_BADGES[0]);
    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
                <View style={{ gap: 2, paddingHorizontal: 10, paddingBottom: 10 }}>
                    {AVAILABLE_BADGES.map((badge) => (
                        <OptionRow
                            key={badge.name}
                            testID={`badge-option-${badge.displayName}`}
                            label={badge.displayName}
                            selected={badge === selected}
                            onPress={() => setSelected(badge)}
                        />
                    ))}
                </View>
            </ScrollView>
            <DialogFooter>
                <Button testID="badge-cancel" label="Cancel" onPress={onCancel} />
                <Button testID="badge-ok" label="Add" variant="primary" onPress={() => onPick(selected)} />
            </DialogFooter>
        </View>
    );
}
