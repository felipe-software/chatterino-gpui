import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { View } from "@felipe-software/react-native-gpui";
import { MenuPanel } from "../../overlays/MenuPanel";
import type { MenuEntry } from "../../state/overlays";

export type MenuRequest = { x: number; y: number; entries: MenuEntry[]; alignRight?: boolean; minWidth?: number };

export type MenuHostApi = { open: (request: MenuRequest) => string; close: () => void; openId: string | null };

type OpenMenu = MenuRequest & { id: string };

export const MenuHostContext = createContext<MenuHostApi | null>(null);

export function useMenuHost(): MenuHostApi | null {
    return useContext(MenuHostContext);
}

export function MenuHost({ children }: { children: ReactNode }) {
    const [menu, setMenu] = useState<OpenMenu | null>(null);
    const nextId = useRef(0);
    const api = useMemo<MenuHostApi>(
        () => ({
            open: (request) => {
                nextId.current += 1;
                const id = `host-menu-${nextId.current}`;
                setMenu({ ...request, id });
                return id;
            },
            close: () => setMenu(null),
            openId: menu?.id ?? null,
        }),
        [menu],
    );
    const close = () => setMenu(null);
    return (
        <MenuHostContext.Provider value={api}>
            {children}
            {menu ? (
                <View style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}>
                    <View testID="menu-host-backdrop" style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }} onMouseDown={close} />
                    <MenuPanel entries={menu.entries} x={menu.x} y={menu.y} alignRight={menu.alignRight} minWidth={menu.minWidth} path="" onDone={close} />
                </View>
            ) : null}
        </MenuHostContext.Provider>
    );
}
