export type ComposerMetrics = {
    minHeight: number;
    lineHeight: number;
    textInset: number;
    emoteSize: number;
    emoteIcon: number;
    emoteInset: number;
    border: number;
};

const LINE_HEIGHT = 20;
const BORDER = 1;
const REPLY_GAP = 6;

function metrics(minHeight: number, emoteSize: number, emoteIcon: number): ComposerMetrics {
    const inner = minHeight - BORDER;
    return {
        minHeight,
        lineHeight: LINE_HEIGHT,
        textInset: (inner - LINE_HEIGHT) / 2,
        emoteSize,
        emoteIcon,
        emoteInset: (inner - emoteSize) / 2,
        border: BORDER,
    };
}

const REGULAR = metrics(38, 30, 20);
const COMPACT = metrics(34, 30, 20);

export function composerMetrics(compact: boolean): ComposerMetrics {
    return compact ? COMPACT : REGULAR;
}

export const COMPOSER_REPLY_GAP = REPLY_GAP;
