import type { SplitNode } from "../../../data/api";
import { normalizeSizes } from "../../layout/tree";

type Box = { x: number; y: number; width: number; height: number };

const FRAME: Box = { x: 3.5, y: 4.5, width: 17, height: 15 };

function format(value: number): string {
    return String(Math.round(value * 10) / 10);
}

function dividerPath(node: SplitNode, box: Box, out: string[]): void {
    if (node.type === "split") return;
    const sideBySide = node.direction === "horizontal";
    const fractions = normalizeSizes(node.sizes.slice(0, node.children.length));
    let offset = 0;
    node.children.forEach((child, index) => {
        const fraction = fractions[index] ?? 0;
        const childBox: Box = sideBySide
            ? { x: box.x + box.width * offset, y: box.y, width: box.width * fraction, height: box.height }
            : { x: box.x, y: box.y + box.height * offset, width: box.width, height: box.height * fraction };
        if (index > 0) {
            const divider = sideBySide ? `M${format(childBox.x)} ${format(box.y)}v${format(box.height)}` : `M${format(box.x)} ${format(childBox.y)}h${format(box.width)}`;
            out.push(divider);
        }
        dividerPath(child, childBox, out);
        offset += fraction;
    });
}

export function splitLayoutIcon(root: SplitNode): string {
    const dividers: string[] = [];
    dividerPath(root, FRAME, dividers);
    const frame = `<rect x="${FRAME.x}" y="${FRAME.y}" width="${FRAME.width}" height="${FRAME.height}" rx="2"/>`;
    const path = dividers.length > 0 ? `<path d="${dividers.join("")}"/>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.9" stroke-linejoin="round">${frame}${path}</svg>`;
}
