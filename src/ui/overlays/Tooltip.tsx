import { Image, Text, View, useWindowDimensions } from "@felipe-software/react-native-gpui";
import { FadeIn } from "../modern/controls/FadeIn";
import { useApp } from "../state/AppContext";
import type { TooltipBlock, TooltipSpec } from "../state/overlays";

type Metrics = { charWidth: number; lineHeight: number; paddingX: number; paddingY: number };

const LEGACY: Metrics = { charWidth: 7.6, lineHeight: 16, paddingX: 10, paddingY: 5 };
const MODERN: Metrics = { charWidth: 7.4, lineHeight: 16, paddingX: 10, paddingY: 6 };
const IMAGE_GAP = 6;
const MAX_TEXT_WIDTH = 380;
const CURSOR_OFFSET = 16;
const IMAGE_SCALE = 4;
const MODERN_FONT_SIZE = 12;
const MODERN_RADIUS = 6;

function imageSize(spec: TooltipSpec): { width: number; height: number } {
    if (!spec.image) return { width: 0, height: 0 };
    return { width: Math.round(spec.anchor.width * IMAGE_SCALE), height: Math.round(spec.anchor.height * IMAGE_SCALE) };
}

function blocksOf(spec: TooltipSpec): TooltipBlock[] {
    if (spec.blocks) return spec.blocks;
    const blocks: TooltipBlock[] = [];
    const image = imageSize(spec);
    if (spec.image) blocks.push({ kind: "image", url: spec.image, width: image.width, height: image.height });
    for (const line of spec.text.split("\n")) blocks.push({ kind: "text", text: line });
    return blocks;
}

function maxLineChars(metrics: Metrics): number {
    return Math.floor(MAX_TEXT_WIDTH / metrics.charWidth);
}

export function wrapTooltipText(text: string, maxChars = maxLineChars(LEGACY)): string[] {
    const lines: string[] = [];
    let line = "";
    for (const word of text.split(/\s+/).filter(Boolean)) {
        const candidate = line ? `${line} ${word}` : word;
        if (candidate.length > maxChars && line) {
            lines.push(line);
            line = word;
        } else {
            line = candidate;
        }
    }
    lines.push(line);
    return lines;
}

function textWidth(block: TooltipBlock, metrics: Metrics): number {
    if (block.kind === "image") return block.width;
    const longest = wrapTooltipText(block.text, maxLineChars(metrics)).reduce((widest, line) => Math.max(widest, line.length), 0);
    return Math.min(MAX_TEXT_WIDTH, Math.ceil(longest * metrics.charWidth));
}

function blockHeight(block: TooltipBlock, metrics: Metrics): number {
    if (block.kind === "image") return block.height + IMAGE_GAP;
    return wrapTooltipText(block.text, maxLineChars(metrics)).length * metrics.lineHeight;
}

export function Tooltip({ spec }: { spec: TooltipSpec }) {
    const { theme, fonts } = useApp();
    const tokens = theme.modern;
    const metrics = tokens ? MODERN : LEGACY;
    const screen = useWindowDimensions();
    const blocks = blocksOf(spec);
    const contentWidth = blocks.reduce((widest, block) => Math.max(widest, textWidth(block, metrics)), 0);
    const width = contentWidth + metrics.paddingX * 2;
    const height = blocks.reduce((sum, block) => sum + blockHeight(block, metrics), 0) + metrics.paddingY * 2;
    const below = spec.placement === "below";
    const cursor = spec.cursor ?? { x: spec.anchor.x + spec.anchor.width / 2, y: spec.anchor.y + spec.anchor.height / 2 };
    const preferredLeft = below ? spec.anchor.x + spec.anchor.width / 2 - width / 2 : cursor.x + CURSOR_OFFSET;
    const preferredTop = below ? spec.anchor.y + spec.anchor.height + 1 : cursor.y + CURSOR_OFFSET;
    const overflowsRight = preferredLeft + width > screen.width;
    const overflowsBottom = preferredTop + height > screen.height;
    const flipUp = !below && overflowsRight && overflowsBottom;
    const left = Math.max(0, Math.min(preferredLeft, screen.width - width));
    const top = flipUp ? cursor.y - height - CURSOR_OFFSET : Math.max(0, Math.min(preferredTop, screen.height - height));
    const textStyle = tokens
        ? { color: tokens.tooltipFg, fontFamily: fonts.uiFamily, fontSize: MODERN_FONT_SIZE, lineHeight: metrics.lineHeight, fontWeight: "500" as const }
        : { color: "#ffffff", fontFamily: fonts.appFamily, fontSize: fonts.appSize };
    const frameStyle = tokens ? { backgroundColor: tokens.tooltipBg, borderRadius: MODERN_RADIUS } : { backgroundColor: "rgba(0, 0, 0, 0.8)" };
    const Frame = tokens ? FadeIn : View;
    return (
        <Frame
            testID="tooltip"
            pointerEvents="none"
            style={{
                position: "absolute",
                left,
                top,
                width,
                paddingHorizontal: metrics.paddingX,
                paddingVertical: metrics.paddingY,
                alignItems: "center",
                ...frameStyle,
            }}
        >
            {blocks.map((block, index) =>
                block.kind === "image" ? (
                    <Image
                        key={index}
                        testID="tooltip-image"
                        source={{ uri: block.url }}
                        style={{ width: block.width, height: block.height, marginBottom: IMAGE_GAP }}
                        resizeMode="contain"
                    />
                ) : (
                    wrapTooltipText(block.text, maxLineChars(metrics)).map((line, lineIndex) => (
                        <Text key={`${index}-${lineIndex}`} style={{ ...textStyle, textAlign: "center" }}>
                            {line || " "}
                        </Text>
                    ))
                ),
            )}
        </Frame>
    );
}
