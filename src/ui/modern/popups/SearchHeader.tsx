import type { RefObject } from "react";
import { Text, View, type TextInputHandle } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { Chip } from "../controls/Chip";
import { CONTROL_ICONS } from "../controls/icons";
import { TextField } from "../controls/TextField";
import { useModernTokens } from "../controls/useModernTokens";
import { toggleFrom, toggleHasLink } from "./searchQuery";

type Props = { query: string; inputRef: RefObject<TextInputHandle | null>; onQuery: (query: string) => void };

export function SearchHeader({ query, inputRef, onQuery }: Props) {
    const { fonts } = useApp();
    const tokens = useModernTokens();
    const apply = (next: string) => {
        onQuery(next);
        inputRef.current?.focus();
    };
    return (
        <View style={{ gap: 10, paddingBottom: 12 }}>
            <TextField
                ref={inputRef}
                testID="search-input"
                value={query}
                placeholder="Search messages"
                leadingIcon={CONTROL_ICONS.search}
                clearable
                autoFocus
                onChange={onQuery}
            />
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, paddingRight: 4 }}>
                <Text style={{ color: tokens.text3, fontFamily: fonts.uiFamily, fontSize: 12, lineHeight: 16 }}>Narrow it down</Text>
                <Chip testID="search-chip-from" label="from:user" monospace onPress={() => apply(toggleFrom(query))} />
                <Chip testID="search-chip-link" label="has:link" monospace onPress={() => apply(toggleHasLink(query))} />
            </View>
        </View>
    );
}
