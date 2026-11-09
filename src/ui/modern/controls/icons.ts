function stroke(body: string, width: number): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

export const CONTROL_ICONS = {
    checkBold: stroke(`<path d="M5 12.5l4.5 4.5L19 7.5"/>`, 3.4),
    checkMark: stroke(`<path d="M5 12.5l4.5 4.5L19 7.5"/>`, 2.6),
    chevronDown: stroke(`<path d="M6 9l6 6 6-6"/>`, 2),
    chevronUp: stroke(`<path d="M6 15l6-6 6 6"/>`, 2),
    chevronRight: stroke(`<path d="M9 6l6 6-6 6"/>`, 2.2),
    clear: stroke(`<path d="M6 6l12 12M18 6L6 18"/>`, 2.4),
    search: stroke(`<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>`, 2),
    info: stroke(`<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><path d="M12 8h.01"/>`, 2),
    warning: stroke(`<path d="M12 4l9 16H3z"/><path d="M12 10v4"/><path d="M12 17h.01"/>`, 2),
    error: stroke(`<circle cx="12" cy="12" r="8.5"/><path d="M12 8v5"/><path d="M12 16h.01"/>`, 2),
    success: stroke(`<path d="M5 12.5l4.5 4.5L19 7.5"/>`, 2.2),
};

export function isSvgMarkup(icon: string): boolean {
    return icon.trimStart().startsWith("<svg");
}
