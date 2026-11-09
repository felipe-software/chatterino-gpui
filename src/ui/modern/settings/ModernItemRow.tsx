import { fontsFor } from "../../fonts";
import { ColorButton } from "../../settings/ColorButton";
import { openFontPicker } from "../../settings/FontSettingWidget";
import { unsupportedTooltip } from "../../settings/generalHelpers";
import type { GeneralItem, SettingsAccess } from "../../settings/generalTypes";
import { SComboBox } from "../../settings/SComboBox";
import { useSettingsUi } from "../../settings/SettingsContext";
import { SLineEdit } from "../../settings/SLineEdit";
import { SpinBox } from "../../settings/SpinBox";
import { useApp } from "../../state/AppContext";
import { Button } from "../controls/Button";
import { SegmentedControl } from "../controls/SegmentedControl";
import { Switch } from "../controls/Switch";
import type { ModernItemRowSpec } from "./modernGeneralPages";
import { displayOptions, displayValue, itemLabel } from "./modernRows";
import { SettingPathValue } from "./SettingPathValue";
import { SettingRow } from "./SettingRow";
import { SettingValueText } from "./SettingValueText";

type Props = { item: GeneralItem; spec: ModernItemRowSpec; access: SettingsAccess };

const INPUT_WIDTH = 220;
const WIDE_INPUT_WIDTH = 320;

function tooltipOf(item: GeneralItem): string | undefined {
    if (!("unsupported" in item) && !("tooltip" in item)) return undefined;
    return unsupportedTooltip(item.tooltip, item.unsupported);
}

function isDisabled(item: GeneralItem, access: SettingsAccess): boolean {
    if (!("enabled" in item) || !item.enabled) return false;
    return !item.enabled(access);
}

export function ModernItemRow({ item, spec, access }: Props) {
    const ui = useSettingsUi();
    const { settings } = useApp();
    const label = spec.label ?? itemLabel(item);
    const disabled = isDisabled(item, access);
    const testID = `setting-${item.id}`;
    const row = { label, hint: spec.hint, tooltip: tooltipOf(item), disabled, testID: `setting-row-${item.id}` };

    switch (item.kind) {
        case "checkbox":
            return (
                <SettingRow {...row}>
                    <Switch testID={testID} label={label} value={item.get(access)} disabled={disabled} onChange={(value) => item.set(access, value)} />
                </SettingRow>
            );
        case "dropdown": {
            const options = displayOptions(item.options, spec);
            const value = displayValue(item.get(access), spec);
            if (spec.segment) {
                return (
                    <SettingRow {...row}>
                        <SegmentedControl testID={testID} options={options} value={value} disabled={disabled} onChange={(next) => item.set(access, next)} />
                    </SettingRow>
                );
            }
            return (
                <SettingRow {...row}>
                    <SComboBox
                        testID={testID}
                        value={value}
                        options={options}
                        placeholder={spec.placeholder ?? item.placeholder}
                        disabled={disabled}
                        greyable={false}
                        onChange={(next) => item.set(access, next)}
                    />
                </SettingRow>
            );
        }
        case "intInput":
            return (
                <SettingRow {...row}>
                    <SpinBox
                        testID={testID}
                        value={item.get(access)}
                        min={item.min}
                        max={item.max}
                        step={item.step}
                        suffix={spec.unit ?? item.suffix}
                        onChange={(value) => item.set(access, value)}
                    />
                </SettingRow>
            );
        case "lineEdit":
            return (
                <SettingRow {...row}>
                    <SLineEdit
                        testID={testID}
                        value={item.get(access)}
                        placeholder={spec.placeholder ?? item.placeholder}
                        width={spec.wide ? WIDE_INPUT_WIDTH : INPUT_WIDTH}
                        disabled={disabled}
                        onChange={(value) => item.set(access, value)}
                    />
                </SettingRow>
            );
        case "color":
            return (
                <SettingRow {...row}>
                    <ColorButton testID={testID} color={item.get(access)} onChange={(value) => item.set(access, value)} />
                </SettingRow>
            );
        case "font": {
            const family = settings.fontFamily || fontsFor({ ...settings, uiStyle: "chatterino" }).chatFamily;
            return (
                <SettingRow {...row}>
                    <SettingValueText testID={`${testID}-current`} value={`${family} · ${settings.fontSize} pt`} />
                    <Button testID={testID} label="Change" onPress={() => openFontPicker(ui, settings, family, access.update)} />
                </SettingRow>
            );
        }
        case "buttons": {
            const buttons = item.buttons.map((button) => (
                <Button key={button.id} testID={`setting-${button.id}`} label={spec.buttonLabels?.[button.id] ?? button.label} onPress={() => button.onPress(access)} />
            ));
            if (!spec.pathValue) return <SettingRow {...row}>{buttons}</SettingRow>;
            return (
                <SettingRow {...row} stacked>
                    <SettingPathValue testID={`${testID}-path`} value={spec.pathValue(access)} />
                    {buttons}
                </SettingRow>
            );
        }
        default:
            return null;
    }
}
