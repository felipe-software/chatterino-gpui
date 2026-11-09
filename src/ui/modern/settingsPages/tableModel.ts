import type { ReactNode } from "react";
import type { MouseResponderEvent } from "@felipe-software/react-native-gpui";

export type DragBinding = {
    onMouseDown: (event: MouseResponderEvent) => void;
    onMouseMove: (event: MouseResponderEvent) => void;
    onMouseUp: (event: MouseResponderEvent) => void;
};

export type CellState = {
    hovered: boolean;
    dragging: boolean;
    drag?: DragBinding;
};

export type ModernColumn<T> = {
    key: string;
    title?: string;
    width?: number;
    flex?: number;
    render: (row: T, index: number, state: CellState) => ReactNode;
};

export type RowReorder = {
    first: number;
    last: number;
    onMove: (from: number, to: number) => void;
};

export type TableMetrics = {
    gap: number;
    paddingLeft: number;
    paddingRight: number;
    minRowHeight: number;
    rowPaddingVertical?: number;
    alignItems?: "center" | "flex-start";
};

export function columnBox(column: { width?: number; flex?: number }) {
    if (column.width !== undefined) return { width: column.width, flexShrink: 0 };
    return { flexGrow: column.flex ?? 1, flexShrink: 1, flexBasis: 0, minWidth: 0 };
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
}

export function hiddenRows<T>(query: string, rows: T[], texts: (row: T) => Array<string | undefined>): Set<number> | undefined {
    const needle = query.trim().toLowerCase();
    if (!needle) return undefined;
    const hidden = new Set<number>();
    rows.forEach((row, index) => {
        const matches = texts(row).some((text) => !!text && text.toLowerCase().includes(needle));
        if (!matches) hidden.add(index);
    });
    return hidden;
}

export function replaceAt<T>(items: T[], index: number, patch: Partial<T>): T[] {
    return items.map((item, position) => (position === index ? { ...item, ...patch } : item));
}

export function removeAt<T>(items: T[], index: number): T[] {
    return items.filter((_, position) => position !== index);
}
