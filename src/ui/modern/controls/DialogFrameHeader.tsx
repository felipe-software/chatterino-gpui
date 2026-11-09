import { isValidElement, type ReactNode } from "react";
import type { MouseResponderEvent } from "@felipe-software/react-native-gpui";
import { DialogHeader } from "./DialogHeader";

type Props = {
    testID: string;
    title: string;
    header?: ReactNode;
    frameless: boolean;
    decorated: boolean;
    onClose: () => void;
    onMouseDown?: (event: MouseResponderEvent) => void;
    onMouseMove?: (event: MouseResponderEvent) => void;
    onMouseUp?: (event: MouseResponderEvent) => void;
};

export function DialogFrameHeader({ testID, title, header, frameless, decorated, onClose, onMouseDown, onMouseMove, onMouseUp }: Props) {
    const drag = { onMouseDown, onMouseMove, onMouseUp };
    const closeTestID = `${testID}-close`;
    if (header !== undefined && header !== null) {
        if (isValidElement(header) && header.type === DialogHeader) return header;
        return (
            <DialogHeader onClose={onClose} closeTestID={closeTestID} {...drag}>
                {header}
            </DialogHeader>
        );
    }
    if (frameless || decorated) return null;
    return <DialogHeader title={title} onClose={onClose} closeTestID={closeTestID} {...drag} />;
}
