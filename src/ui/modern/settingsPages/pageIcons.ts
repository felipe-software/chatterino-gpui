function stroke(body: string, width: number): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

function dots(points: Array<[number, number]>): string {
    const circles = points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#000" stroke="none"/>`).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${circles}</svg>`;
}

export const PAGE_ICONS = {
    grip: dots([
        [9, 6],
        [15, 6],
        [9, 12],
        [15, 12],
        [9, 18],
        [15, 18],
    ]),
    trash: stroke(`<path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6.5 7l1 13h9l1-13"/>`, 1.9),
    pencil: stroke(`<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>`, 1.9),
    lock: stroke(`<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>`, 1.9),
    info: stroke(`<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><path d="M12 8h.01"/>`, 1.9),
    alert: stroke(`<circle cx="12" cy="12" r="8.5"/><path d="M12 8v5"/><path d="M12 16h.01"/>`, 2.4),
    valid: stroke(`<path d="M5 12.5l4.5 4.5L19 7.5"/>`, 2.6),
    book: stroke(
        `<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"/>`,
        1.9,
    ),
    sparkle: stroke(`<path d="M12 3l1.9 5.6 5.6 1.4-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/>`, 1.9),
    discord: stroke(`<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>`, 1.9),
    plug: stroke(`<path d="M9 3v5M15 3v5"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v4"/>`, 1.8),
    badge: stroke(`<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M9 12h6M12 9v6"/>`, 1.8),
    purge: stroke(`<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>`, 2),
    clock: stroke(`<path d="M12 7v5l3 2M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z"/>`, 2),
    warn: stroke(`<path d="M12 4l9 16H3zM12 10v4M12 17h.01"/>`, 2),
    ban: stroke(`<path d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM6 6l12 12"/>`, 2),
    command: stroke(`<path d="M5 7l5 5-5 5"/><path d="M12 17h7"/>`, 2),
    tag: stroke(`<path d="M3.5 12V4h8l9 9-8 8z"/><circle cx="7.8" cy="8.3" r="1.3"/>`, 1.8),
    filter: stroke(`<path d="M4 5h16l-6 7.5V19l-4 1.5v-8z"/>`, 1.8),
    eyeOff: stroke(
        `<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.5 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>`,
        1.8,
    ),
    bell: stroke(`<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>`, 1.8),
    shield: stroke(`<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/>`, 1.8),
    user: stroke(`<circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6"/>`, 1.8),
    sound: stroke(`<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>`, 1.9),
};
