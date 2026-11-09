function stroke(body: string, width: number): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

export const SPLIT_ICONS = {
    addSplit: stroke(`<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M12 4.5v15M16.5 10v4M14.5 12h4"/>`, 1.9),
    moderation: stroke(`<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/>`, 1.9),
    move: stroke(`<path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>`, 1.9),
    left: stroke(`<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>`, 2.2),
    right: stroke(`<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>`, 2.2),
    above: stroke(`<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/>`, 2.2),
    below: stroke(`<path d="M12 5v14"/><path d="M6 13l6 6 6-6"/>`, 2.2),
};
