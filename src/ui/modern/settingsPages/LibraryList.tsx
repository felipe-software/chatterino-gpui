import { Text, View } from "@felipe-software/react-native-gpui";
import { useApp } from "../../state/AppContext";
import { Link } from "../controls/Link";
import { useModernTokens } from "../controls/useModernTokens";
import { SettingsCard } from "../settings/SettingsCard";

export type Library = { name: string; url: string; onLicense: () => void };

type Props = { libraries: Library[] };

const COLUMNS = 3;

export function LibraryList({ libraries }: Props) {
    const { fonts, openUrl } = useApp();
    const tokens = useModernTokens();
    const rows: Library[][] = [];
    for (let index = 0; index < libraries.length; index += COLUMNS) rows.push(libraries.slice(index, index + COLUMNS));
    return (
        <SettingsCard tokens={tokens}>
            <View style={{ paddingVertical: 6 }}>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={{ flexDirection: "row" }}>
                        {Array.from({ length: COLUMNS }, (_, column) => {
                            const library = row[column];
                            return (
                                <View
                                    key={library?.name ?? `empty-${column}`}
                                    style={{
                                        flexGrow: 1,
                                        flexShrink: 1,
                                        flexBasis: 0,
                                        minWidth: 0,
                                        height: 36,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 8,
                                        paddingHorizontal: 16,
                                    }}
                                >
                                    {library ? (
                                        <>
                                            <Text
                                                numberOfLines={1}
                                                accessibilityRole="link"
                                                onPress={() => openUrl(library.url)}
                                                style={{
                                                    flexShrink: 1,
                                                    minWidth: 0,
                                                    color: tokens.text,
                                                    fontFamily: fonts.uiFamily,
                                                    fontSize: 13,
                                                    lineHeight: 18,
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {library.name}
                                            </Text>
                                            <Link testID={`about-license-${library.name}`} label="License" size={12} onPress={library.onLicense} />
                                        </>
                                    ) : null}
                                </View>
                            );
                        })}
                    </View>
                ))}
            </View>
        </SettingsCard>
    );
}
