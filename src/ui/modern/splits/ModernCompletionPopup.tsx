import type { CompletionRow } from "../../splits/CompletionPopup";
import { FadeIn } from "../controls/FadeIn";
import { useModernTokens } from "../controls/useModernTokens";
import { ModernCompletionRow } from "./ModernCompletionRow";

type Props = {
    rows: CompletionRow[];
    selected: number;
    bottom: number;
    left: number;
    onPick: (row: CompletionRow) => void;
};

const VISIBLE_ROWS = 6;
const WIDTH = 320;
const PADDING = 4;
const GAP = 6;

export function ModernCompletionPopup({ rows, selected, bottom, left, onPick }: Props) {
    const tokens = useModernTokens();
    const start = Math.max(0, Math.min(selected - VISIBLE_ROWS + 1, rows.length - VISIBLE_ROWS));
    const visible = rows.slice(start, start + VISIBLE_ROWS);
    return (
        <FadeIn
            testID="completion-popup"
            style={{
                position: "absolute",
                bottom: bottom + GAP,
                left,
                width: WIDTH,
                padding: PADDING,
                backgroundColor: tokens.bgRaised,
                borderWidth: 1,
                borderColor: tokens.lineStrong,
                borderRadius: 10,
                boxShadow: tokens.shadow,
                zIndex: 20,
            }}
        >
            {visible.map((row, index) => (
                <ModernCompletionRow key={row.key} row={row} selected={start + index === selected} onPick={onPick} />
            ))}
        </FadeIn>
    );
}
