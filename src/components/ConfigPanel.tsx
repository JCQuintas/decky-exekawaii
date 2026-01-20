import {
  Field,
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
    <>
      {fields.map((field, index) => {
        const key = `config-field-${index}`;

        switch (field.type) {
          case "divider":
            return (
              <PanelSectionRow key={key}>
                <Field label={field.title} description={field.description} bottomSeparator='none' childrenLayout='below' />
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
                <SelectField
                  field={field}
                  value={values[field.envVar] as string ?? field.initialValue}
                  onChange={(value) => onChange(field.envVar, value)}
                />
              </PanelSectionRow>
            );

          default:
            return null;
        }
      })}
      <PanelSectionRow >
        <Field childrenLayout='inline' indentLevel={0} padding='none' />
      </PanelSectionRow>
    </>
  );
}
