const MIN_GROUP = 3;
const MIN_SHARED_PREFIX = 4;

function leadingWord(name: string): string {
    const camel = name.match(/^[a-z]{3,}(?=[A-Z0-9])/) ?? name.match(/^[A-Z][a-z]{2,}(?=[A-Z0-9])/);
    return camel ? camel[0].toLowerCase() : "";
}

function sharedPrefix(a: string, b: string): string {
    let index = 0;
    while (index < a.length && index < b.length && a[index] === b[index]) index++;
    return a.slice(0, index);
}

function lowerBound(sorted: string[], value: string): number {
    let low = 0;
    let high = sorted.length;
    while (low < high) {
        const middle = (low + high) >> 1;
        if (sorted[middle] < value) low = middle + 1;
        else high = middle;
    }
    return low;
}

function countWithPrefix(sorted: string[], prefix: string): number {
    return lowerBound(sorted, `${prefix}\uffff`) - lowerBound(sorted, prefix);
}

function sharedFamily(lower: string, sorted: string[]): string {
    const position = lowerBound(sorted, lower);
    const candidates = new Set<string>();
    for (const step of [-1, 1]) {
        let index = step < 0 ? position - 1 : position + 1;
        while (index >= 0 && index < sorted.length) {
            const prefix = sharedPrefix(lower, sorted[index]);
            if (prefix.length < MIN_SHARED_PREFIX) break;
            candidates.add(prefix);
            index += step;
        }
    }
    const valid = [...candidates].filter((prefix) => countWithPrefix(sorted, prefix) >= MIN_GROUP).sort((a, b) => a.length - b.length);
    return valid[0] ?? "";
}

export function emoteFamilies(names: string[]): Map<string, string> {
    const family = new Map<string, string>();
    for (const name of names) family.set(name, leadingWord(name));

    const known = [...new Set([...family.values()].filter(Boolean))].sort((a, b) => b.length - a.length);
    for (const name of names) {
        if (family.get(name)) continue;
        const lower = name.toLowerCase();
        const match = known.find((word) => lower.length > word.length && lower.startsWith(word));
        if (match) family.set(name, match);
    }

    const left = names.filter((name) => !family.get(name));
    const sorted = left.map((name) => name.toLowerCase()).sort();
    for (const name of left) {
        const prefix = sharedFamily(name.toLowerCase(), sorted);
        if (prefix) family.set(name, prefix);
    }

    const sizes = new Map<string, number>();
    for (const value of family.values()) if (value) sizes.set(value, (sizes.get(value) ?? 0) + 1);
    for (const [name, value] of family) if (!value || (sizes.get(value) ?? 0) < MIN_GROUP) family.set(name, "");
    return family;
}
