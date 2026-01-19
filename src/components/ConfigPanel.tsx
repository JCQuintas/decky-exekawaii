import {
  DropdownItem,
  PanelSection,
  PanelSectionRow,
  SliderField,
  ToggleField,
} from "@decky/ui";
import { ConfigField, ConfigFieldValues } from "../plugin-types";

interface ConfigPanelProps {
  fields: ConfigField[];
  values: ConfigFieldValues;
  onChange: (envVar: string, value: string | number | boolean) => void;
}

export function ConfigPanel({ fields, values, onChange }: ConfigPanelProps) {
  if (!fields || fields.length === 0) {
    return null;
  }

  return (
    <PanelSection title="Configuration">
      {fields.map((field, index) => {
        const key = `config-field-${index}`;

        switch (field.type) {
          case "divider":
            return (
              <PanelSectionRow key={key}>
                <div style={{ padding: "8px 0", borderTop: "1px solid #3d4450" }}>
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    {field.title}
                  </div>
                  {field.description && (
                    <div style={{ fontSize: "12px", color: "#8b929a" }}>
                      {field.description}
                    </div>
                  )}
                </div>
              </PanelSectionRow>
            );

          case "boolean":
            return (
              <PanelSectionRow key={key}>
                <ToggleField
                  label={field.title}
                  description={field.description}
                  checked={values[field.envVar] as boolean ?? field.initialValue}
                  onChange={(checked) => onChange(field.envVar, checked)}
                />
              </PanelSectionRow>
            );

          case "number":
            return (
              <PanelSectionRow key={key}>
                <SliderField
                  label={field.title}
                  description={field.description}
                  value={values[field.envVar] as number ?? field.initialValue}
                  min={field.min}
                  max={field.max}
                  step={field.step ?? 1}
                  onChange={(value) => onChange(field.envVar, value)}
                  showValue
                />
              </PanelSectionRow>
            );

          case "select":
            return (
              <PanelSectionRow key={key}>
                <DropdownItem
                  label={field.title}
                  description={field.description}
                  rgOptions={field.options.map((opt) => ({
                    label: opt.label,
                    data: opt.value,
                  }))}
                  selectedOption={values[field.envVar] as string ?? field.initialValue}
                  onChange={(option) => onChange(field.envVar, option.data)}
                />
              </PanelSectionRow>
            );

          default:
            return null;
        }
      })}
    </PanelSection>
  );
}
