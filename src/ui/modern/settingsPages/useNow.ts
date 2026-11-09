import { useEffect, useState } from "react";

export function useNow(active: boolean, intervalMs = 1000): number {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!active) return;
        const timer = setInterval(() => setNow(Date.now()), intervalMs);
        return () => clearInterval(timer);
    }, [active, intervalMs]);
    return now;
}

export function uptimeLabel(startedAt: number, now: number): string {
    const total = Math.max(0, Math.floor((now - startedAt) / 1000));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
}
