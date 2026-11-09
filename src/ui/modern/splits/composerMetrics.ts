export type ComposerMetrics = {
    minHeight: number;
    lineHeight: number;
    textInset: number;
    emoteSize: number;
    emoteIcon: number;
    emoteInset: number;
    paddingTop: number;
    paddingHorizontal: number;
    paddingBottom: number;
    dividerWidth: number;
};

const LINE_HEIGHT = 20;
const BORDER = 1;
const REPLY_GAP = 6;

function metrics(minHeight: number, emoteSize: number, emoteIcon: number, padding: [number, number, number], dividerWidth: number): ComposerMetrics {
    const inner = minHeight - BORDER * 2;
    return {
        minHeight,
        lineHeight: LINE_HEIGHT,
        textInset: (inner - LINE_HEIGHT) / 2,
        emoteSize,
        emoteIcon,
        emoteInset: (inner - emoteSize) / 2,
        paddingTop: padding[0],
        paddingHorizontal: padding[1],
        paddingBottom: padding[2],
        dividerWidth,
    };
}

const REGULAR = metrics(44, 36, 22, [8, 10, 10], 1);
const COMPACT = metrics(40, 34, 21, [6, 8, 8], 0);

export function composerMetrics(compact: boolean): ComposerMetrics {
    return compact ? COMPACT : REGULAR;
}

export const COMPOSER_REPLY_GAP = REPLY_GAP;
