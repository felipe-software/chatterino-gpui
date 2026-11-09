import type { ModernPageName } from "./modernSettingsPages";

function navIcon(body: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

export const SETTINGS_NAV_ICONS: Record<ModernPageName, string> = {
    Appearance: navIcon(`<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="#000"/>`),
    Chat: navIcon(`<path d="M4 5h16v11H9l-5 4z"/>`),
    "Emotes and badges": navIcon(`<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14.5c1.8 2 5.2 2 7 0"/><path d="M9 9.5v.5M15 9.5v.5"/>`),
    "Streamer mode": navIcon(
        `<circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8"/>`,
    ),
    Advanced: navIcon(`<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>`),
    Accounts: navIcon(`<circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6"/>`),
    Nicknames: navIcon(`<path d="M3.5 12V4h8l9 9-8 8z"/><circle cx="7.8" cy="8.3" r="1.3"/>`),
    Commands: navIcon(`<path d="M5 7l5 5-5 5"/><path d="M12 17h7"/>`),
    Highlights: navIcon(`<path d="M12 3l1.9 5.6 5.6 1.4-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M18 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>`),
    Ignores: navIcon(
        `<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.5 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>`,
    ),
    Filters: navIcon(`<path d="M4 5h16l-6 7.5V19l-4 1.5v-8z"/>`),
    Hotkeys: navIcon(`<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6.5 10h.01M10.5 10h.01M14.5 10h.01M18 10h.01M7.5 14h9"/>`),
    Moderation: navIcon(`<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/>`),
    "Live Notifications": navIcon(`<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>`),
    "External tools": navIcon(`<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>`),
    Plugins: navIcon(`<path d="M9 3v5M15 3v5"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v4"/>`),
    About: navIcon(`<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><path d="M12 8h.01"/>`),
};
