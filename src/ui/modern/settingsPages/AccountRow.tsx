import type { ReactNode } from "react";
import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { Avatar } from "../controls/Avatar";
import { Button } from "../controls/Button";
import { IconButton } from "../controls/IconButton";
import { useModernTokens } from "../controls/useModernTokens";
import { PAGE_ICONS } from "./pageIcons";

type Props = {
    testID: string;
    name: string;
    avatarName: string;
    avatarColor: string;
    description: string;
    current: boolean;
    first: boolean;
    tag?: ReactNode;
    onSwitch: () => void;
    onRemove?: () => void;
};

export function AccountRow({ testID, name, avatarName, avatarColor, description, current, first, tag, onSwitch, onRemove }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    return (
        <View
            testID={testID}
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                minHeight: first ? 68 : 69,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderTopWidth: first ? 0 : 1,
                borderTopColor: tokens.lineSubtle,
            }}
        >
            <Avatar name={avatarName} size={36} color={avatarColor} />
            <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, gap: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text
                        numberOfLines={1}
                        style={{ flexShrink: 1, color: tokens.text, fontFamily: fonts.uiFamily, fontSize: 14, lineHeight: 20, fontWeight: "600" }}
                    >
                        {name}
                    </Text>
                    {tag}
                </View>
                <Text style={{ minWidth: 0, color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>{description}</Text>
            </View>
            {current ? null : <Button testID={`${testID}-switch`} label="Switch" onPress={onSwitch} />}
            {onRemove ? (
                <IconButton
                    testID={`${testID}-remove`}
                    icon={PAGE_ICONS.trash}
                    iconSize={17}
                    tone="danger"
                    label={`Remove ${name}`}
                    onPress={() => onRemove()}
                />
            ) : null}
        </View>
    );
}
