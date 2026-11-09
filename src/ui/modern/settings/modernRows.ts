import type { GeneralItem } from "../../settings/generalTypes";
import type { ListOption } from "../../settings/SettingsContext";
import type { ModernItemRowSpec } from "./modernGeneralPages";

export type ItemIndex = Map<string, GeneralItem>;

export type DropdownItem = Extract<GeneralItem, { kind: "dropdown" }>;

export function indexItems(items: GeneralItem[]): ItemIndex {
    return new Map(items.map((item) => [item.id, item]));
}

export function dropdownItem(items: ItemIndex, id: string): DropdownItem | undefined {
    const item = items.get(id);
    return item?.kind === "dropdown" ? item : undefined;
}

export function displayOptions(base: ListOption[], spec: Pick<ModernItemRowSpec, "options" | "relabel">): ListOption[] {
    const listed = spec.options ? spec.options.filter((option) => base.some((entry) => entry.value === option.value)) : base;
    return listed.map((option) => ({ value: option.value, label: spec.relabel?.[option.value] ?? option.label }));
}

export function displayValue(value: string, spec: Pick<ModernItemRowSpec, "valueAlias">): string {
    return spec.valueAlias?.[value] ?? value;
}

export function itemLabel(item: GeneralItem): string {
    return "label" in item ? item.label : "";
}
