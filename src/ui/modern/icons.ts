function stroke(body: string, width = 1.9, viewBox = "0 0 24 24"): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" stroke="#000" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

function dots(points: Array<[number, number]>): string {
    const circles = points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#000" stroke="none"/>`).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${circles}</svg>`;
}

export const MODERN_ICONS = {
    close: stroke(`<path d="M6 6l12 12M18 6L6 18"/>`, 2.2),
    plus: stroke(`<path d="M12 5v14M5 12h14"/>`, 2),
    account: stroke(`<circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6"/>`),
    settings: stroke(`<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>`),
    eye: stroke(`<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>`),
    search: stroke(`<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>`),
    kebab: dots([
        [12, 5],
        [12, 12],
        [12, 19],
    ]),
    more: dots([
        [5, 12],
        [12, 12],
        [19, 12],
    ]),
    emote: stroke(`<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1.8 2 5.2 2 7 0"/><path d="M9 9.5v.5M15 9.5v.5"/>`, 1.8),
    reply: stroke(`<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v3"/>`),
    copy: stroke(`<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 5H6a1 1 0 0 0-1 1v9"/>`),
    arrowDown: stroke(`<path d="M12 5v14"/><path d="M6 13l6 6 6-6"/>`, 2.4),
    check: stroke(`<path d="M5 12.5l4.5 4.5L19 7.5"/>`, 3),
    chevronDown: stroke(`<path d="M6 9l6 6 6-6"/>`, 2),
    chevronRight: stroke(`<path d="M9 6l6 6-6 6"/>`, 2),
    externalLink: stroke(`<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>`, 2.2),
    clipboard: stroke(
        `<rect x="7" y="4" width="10" height="4" rx="1"/><path d="M7 6H5.5A1.5 1.5 0 0 0 4 7.5v11A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 18.5 6H17"/>`,
    ),
    channel: stroke(`<path d="M9.5 4L7.5 20M16.5 4l-2 16M4.5 9h16M3.5 15h16"/>`),
    whispers: stroke(`<path d="M4 5h16v11H9l-5 4zM9 10.5h.01M12 10.5h.01M15 10.5h.01"/>`),
    mentions: stroke(`<path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>`),
    watching: stroke(`<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>`),
    live: stroke(`<path d="M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8"/>`),
    automod: stroke(`<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-4.5"/>`),
    chat: stroke(`<path d="M4 5h16v11H9l-5 4z"/>`, 1.8),
    replyCurve: stroke(`<path d="M1 10V6a4 4 0 0 1 4-4h8"/>`, 1.5, "0 0 14 10"),
};

export type ModernIconName = keyof typeof MODERN_ICONS;
