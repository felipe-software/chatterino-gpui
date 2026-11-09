import { useState } from "react";
import type { MouseResponderEvent } from "@felipe-software/react-native-gpui";

export type PressHandlers = {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onMouseDown: (event: MouseResponderEvent) => void;
    onMouseUp: () => void;
};

export type PressState = { hovered: boolean; pressed: boolean; handlers: PressHandlers };

export function usePressState(disabled = false): PressState {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);
    const enabled = !disabled;
    return {
        hovered: enabled && hovered,
        pressed: enabled && pressed,
        handlers: {
            onMouseEnter: () => setHovered(true),
            onMouseLeave: () => {
                setHovered(false);
                setPressed(false);
            },
            onMouseDown: (event) => {
                if (event.nativeEvent.pressDrag) return;
                setPressed(true);
            },
            onMouseUp: () => setPressed(false),
        },
    };
}
