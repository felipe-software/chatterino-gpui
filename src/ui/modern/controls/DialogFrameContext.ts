import { createContext, useContext } from "react";

export type DialogFrame = { decorated: boolean };

export const DialogFrameContext = createContext<DialogFrame>({ decorated: false });

export function useDialogFrame(): DialogFrame {
    return useContext(DialogFrameContext);
}
