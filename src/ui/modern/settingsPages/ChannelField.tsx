import { TextField } from "../controls/TextField";

type Props = { testID: string; label: string; value: number; onChange: (value: number) => void };

const BYTE = /^\d{1,3}$/;

export function ChannelField({ testID, label, value, onChange }: Props) {
    return (
        <TextField
            testID={testID}
            size="md"
            prefix={label}
            accessibilityLabel={label}
            value={String(value)}
            grow
            onChange={(text) => {
                if (!BYTE.test(text)) return;
                onChange(Math.min(255, Number.parseInt(text, 10)));
            }}
        />
    );
}
