import * as gpui from "@felipe-software/react-native-gpui";
import { defaultStorage } from "../../data/core/runtime";
import { loadWindowGeometry, sanitizeWindowGeometry, save, STORAGE_KEYS, type WindowGeometry } from "../../data/persistence";

export function savedWindowGeometry(): WindowGeometry {
    return loadWindowGeometry(defaultStorage());
}

export function saveWindowGeometry(geometry: WindowGeometry): void {
    const clean = sanitizeWindowGeometry(geometry);
    if (clean) save(defaultStorage(), STORAGE_KEYS.window, clean);
}

type WindowFrame = { x: number; y: number; width: number; height: number; maximized: boolean };

type MainWindowApi = {
    addFrameListener(listener: (frame: WindowFrame) => void): { remove(): void };
    setFrame(update: { width?: number; height?: number; maximized?: boolean }): void;
};

const mainWindow = (gpui as Record<string, unknown>).MainWindow as MainWindowApi | undefined;

function geometryOf(frame: WindowFrame): WindowGeometry {
    const geometry: WindowGeometry = { width: frame.width, height: frame.height, x: frame.x, y: frame.y };
    if (frame.maximized) geometry.maximized = true;
    return geometry;
}

export function persistWindowGeometry(): () => void {
    if (!mainWindow) return () => undefined;
    const subscription = mainWindow.addFrameListener((frame) => saveWindowGeometry(geometryOf(frame)));
    return () => subscription.remove();
}

export function applyWindowGeometry(geometry: WindowGeometry): void {
    saveWindowGeometry(geometry);
    mainWindow?.setFrame({ width: geometry.width, height: geometry.height, maximized: geometry.maximized === true });
}
