function stroke(body: string, width = 1.9): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

export const POPUP_ICONS = {
    pin: stroke(`<path d="M9 4h6l-1 6 3 3H7l3-3z"/><path d="M12 13v7"/>`),
};
