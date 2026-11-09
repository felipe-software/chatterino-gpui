import { describe, expect, test } from "bun:test";
import type { WindowLayout } from "../../../data/api";
import { monthYear, sinceYear, splitForChannel, timeoutLabel, timeoutSeconds } from "./userCardData";

describe("user card data", () => {
    test("dates read as month and year", () => {
        expect(monthYear(new Date(2018, 6, 20).getTime())).toBe("Jul 2018");
        expect(sinceYear(new Date(2024, 0, 2).getTime())).toBe("Since 2024");
    });

    test("timeout buttons keep their unit", () => {
        expect(timeoutLabel({ value: 30, unit: "m" })).toBe("30m");
        expect(timeoutSeconds({ value: 30, unit: "m" })).toBe(1800);
        expect(timeoutSeconds({ value: 1, unit: "w" })).toBe(604_800);
    });

    test("the split for a channel prefers the selected tab's focused split", () => {
        const layout: WindowLayout = {
            selectedTabId: "b",
            tabs: [
                { id: "a", root: { type: "split", id: "a1", channel: "forsen" } },
                {
                    id: "b",
                    focusedSplitId: "b2",
                    root: {
                        type: "container",
                        id: "b0",
                        direction: "horizontal",
                        sizes: [0.5, 0.5],
                        children: [
                            { type: "split", id: "b1", channel: "forsen" },
                            { type: "split", id: "b2", channel: "forsen" },
                        ],
                    },
                },
            ],
        };
        expect(splitForChannel(layout, "forsen")).toBe("b2");
        expect(splitForChannel({ ...layout, selectedTabId: "a" }, "forsen")).toBe("a1");
        expect(splitForChannel(layout, "xqc")).toBeUndefined();
    });
});
