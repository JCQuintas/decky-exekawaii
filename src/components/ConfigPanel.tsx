import {
  DialogButton,
  Focusable,
  PanelSection,
  PanelSectionRow,
  SliderField,
  ToggleField,
} from "@decky/ui";
import { useState } from "react";
import { FaCheck, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { ConfigField, ConfigFieldValues } from "../plugin-types";

interface ConfigPanelProps {
  fields: ConfigField[];
  values: ConfigFieldValues;
  onChange: (envVar: string, value: string | number | boolean) => void;
}

interface SelectFieldProps {
  field: Extract<ConfigField, { type: "select" }>;
  value: string;
  onChange: (value: string) => void;
}

function SelectField({ field, value, onChange }: SelectFieldProps) {
  const [expanded, setExpanded] = useState(false);
  const selectedOption = field.options.find((opt) => opt.value === value);

  return (
    <Focusable style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ marginBottom: "4px" }}>
        <div style={{ fontWeight: "500" }}>{field.title}</div>
        {field.description && (
          <div style={{ fontSize: "12px", color: "#8b929a" }}>
            {field.description}
          </div>
        )}
      </div>
      <DialogButton onClick={() => setExpanded(!expanded)}>
        <Focusable style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{selectedOption?.label || value || "Select..."}</span>
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </Focusable>
      </DialogButton>
      {expanded && (
        <Focusable style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
          {field.options.map((opt) => (
            <DialogButton
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setExpanded(false);
              }}
              style={{
                backgroundColor: opt.value === value ? "#1a472a" : undefined,
              }}
            >
              <Focusable style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{opt.label}</span>
                {opt.value === value && <FaCheck />}
              </Focusable>
            </DialogButton>
          ))}
        </Focusable>
      )}
    </Focusable>
  );
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
    </PanelSection>
  );
}
