import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { Divider } from "../controls/Divider";
import { useModernTokens } from "../controls/useModernTokens";
import { SettingsCard } from "./SettingsCard";

type Props = { children: ReactNode };

export function SettingRowsCard({ children }: Props) {
    const tokens = useModernTokens();
    const rows = Children.toArray(children);
    if (rows.length === 0) return null;
    return (
        <SettingsCard tokens={tokens}>
            {rows.map((row, index) => (
                <Fragment key={isValidElement(row) && row.key !== null ? row.key : index}>
                    {index > 0 ? <Divider /> : null}
                    {row}
                </Fragment>
            ))}
        </SettingsCard>
    );
}
