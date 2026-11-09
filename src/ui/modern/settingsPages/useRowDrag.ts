import { useRef, useState } from "react";
import type { LayoutChangeEvent, MouseResponderEvent } from "@felipe-software/react-native-gpui";
import type { DragBinding, RowReorder } from "./tableModel";

type Slot = { y: number; height: number };

export type RowDrag = { from: number; to: number; offset: number };

type Press = { index: number; pageY: number; slots: Map<number, Slot> };

const THRESHOLD = 3;

function targetIndex(press: Press, dy: number, reorder: RowReorder): number {
    const own = press.slots.get(press.index);
    if (!own) return press.index;
    const center = own.y + own.height / 2 + dy;
    let to = press.index;
    for (const [index, slot] of press.slots) {
        if (index === press.index || index < reorder.first || index > reorder.last) continue;
        const middle = slot.y + slot.height / 2;
        if (index < press.index && center < middle) to = Math.min(to, index);
        if (index > press.index && center > middle) to = Math.max(to, index);
    }
    return to;
}

function slotTop(press: Press, to: number): number {
    const own = press.slots.get(press.index);
    const target = press.slots.get(to);
    if (!own || !target) return 0;
    if (to <= press.index) return target.y;
    return target.y + target.height - own.height;
}

export function useRowDrag(reorder: RowReorder | undefined) {
    const slots = useRef(new Map<number, Slot>());
    const press = useRef<Press | null>(null);
    const current = useRef<RowDrag | null>(null);
    const [drag, setDrag] = useState<RowDrag | null>(null);

    const publish = (next: RowDrag | null) => {
        current.current = next;
        setDrag(next);
    };

    const binding = (index: number): DragBinding | undefined => {
        if (!reorder || index < reorder.first || index > reorder.last) return undefined;
        return {
            onMouseDown: (event: MouseResponderEvent) => {
                if (event.nativeEvent.pressDrag) return;
                press.current = { index, pageY: event.nativeEvent.pageY, slots: new Map(slots.current) };
            },
            onMouseMove: (event: MouseResponderEvent) => {
                const active = press.current;
                if (!active) return;
                const dy = event.nativeEvent.pageY - active.pageY;
                if (!current.current && Math.abs(dy) < THRESHOLD) return;
                const to = targetIndex(active, dy, reorder);
                const own = active.slots.get(active.index);
                const offset = (own?.y ?? 0) + dy - slotTop(active, to);
                publish({ from: active.index, to, offset });
            },
            onMouseUp: () => {
                const done = current.current;
                press.current = null;
                publish(null);
                if (done && done.to !== done.from) reorder.onMove(done.from, done.to);
            },
        };
    };

    const measure = (index: number) => (event: LayoutChangeEvent) => {
        if (press.current) return;
        const layout = event.nativeEvent.layout;
        slots.current.set(index, { y: layout.y, height: layout.height });
    };

    const order = (count: number): number[] => {
        const indices = Array.from({ length: count }, (_, index) => index);
        if (!drag) return indices;
        indices.splice(drag.from, 1);
        indices.splice(drag.to, 0, drag.from);
        return indices;
    };

    return { drag, binding, measure, order };
}
