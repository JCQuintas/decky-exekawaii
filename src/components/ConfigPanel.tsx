import {
  PanelSection,
  PanelSectionRow,
  SliderField,
  ToggleField
} from "@decky/ui";
import { ConfigField, ConfigFieldValues } from "../plugin-types";
import { SelectField } from './SelectField';

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
    <PanelSection>
      {fields.map((field, index) => {
        const isLastOrNextIsDivider = index === fields.length - 1 || fields[index + 1].type === "divider";
        const isFirst = index === 0;
        const key = `config-field-${index}`;

        switch (field.type) {
          case "divider":
            return (
              <PanelSectionRow key={key}>
                <div style={{ padding: `${isFirst ? "8px" : "16px"} 0 8px 0`, margin: "0px -16px 8px -16px", borderTop: isFirst ? "none" : "1px solid #444" }}>
                  <div style={{ margin: "0 16px" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                      {field.title}
                    </div>
                    {field.description && (
                      <div style={{ fontSize: "12px", color: "#8b929a" }}>
                        {field.description}
                      </div>
                    )}
                  </div>
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
                  bottomSeparator={isLastOrNextIsDivider ? 'none' : 'standard'}
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
                  bottomSeparator={isLastOrNextIsDivider ? 'none' : 'standard'}
                />
              </PanelSectionRow>
            );

          case "select":
            return (
              <PanelSectionRow key={key}>
                <SelectField
                  field={field}
                  value={values[field.envVar] as string ?? field.initialValue}
                  onChange={(value) => onChange(field.envVar, value)}
                  addBottomSeparator={!isLastOrNextIsDivider}
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
