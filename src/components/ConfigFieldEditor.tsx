import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  TextField,
  ToggleField,
} from "@decky/ui";
import { useCallback } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { ConfigField, SelectOption } from "../plugin-types";

export interface ConfigFieldEditorProps {
  field: ConfigField;
  index: number;
  onChange: (index: number, field: ConfigField) => void;
  onRemove: (index: number) => void;
}

export function ConfigFieldEditor({ field, index, onChange, onRemove }: ConfigFieldEditorProps) {
  const updateField = useCallback(
    (key: string, value: any) => onChange(index, { ...field, [key]: value }),
    [field, index, onChange]
  );

  const addSelectOption = useCallback(() => {
    if (field.type === "select") {
      const newOptions = [...field.options, { label: "", value: "" }];
      onChange(index, { ...field, options: newOptions });
    }
  }, [field, index, onChange]);

  const updateSelectOption = useCallback(
    (optIndex: number, key: keyof SelectOption, value: string) => {
      if (field.type === "select") {
        const newOptions = [...field.options];
        newOptions[optIndex] = { ...newOptions[optIndex], [key]: value };
        onChange(index, { ...field, options: newOptions });
      }
    },
    [field, index, onChange]
  );

  const removeSelectOption = useCallback(
    (optIndex: number) => {
      if (field.type === "select") {
        const newOptions = field.options.filter((_, i) => i !== optIndex);
        onChange(index, { ...field, options: newOptions });
      }
    },
    [field, index, onChange]
  );

  return (
    <PanelSection
      title={`${field.type.charAt(0).toUpperCase() + field.type.slice(1)} Field`}
    >
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => onRemove(index)}>
          <FaTrash style={{ marginRight: "8px" }} />
          Remove Field
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <TextField
          label="Title"
          value={field.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </PanelSectionRow>

      <PanelSectionRow>
        <TextField
          label="Description"
          value={field.description || ""}
          onChange={(e) => updateField("description", e.target.value)}
        />
      </PanelSectionRow>

      {field.type !== "divider" && "envVar" in field && (
        <PanelSectionRow>
          <TextField
            label="Environment Variable"
            value={field.envVar}
            onChange={(e) => updateField("envVar", e.target.value)}
          />
        </PanelSectionRow>
      )}

      {field.type === "boolean" && (
        <PanelSectionRow>
          <ToggleField
            label="Initial Value"
            checked={field.initialValue}
            onChange={(checked) => updateField("initialValue", checked)}
          />
        </PanelSectionRow>
      )}

      {field.type === "number" && (
        <>
          <PanelSectionRow>
            <TextField
              label="Initial Value"
              value={String(field.initialValue)}
              onChange={(e) => updateField("initialValue", Number(e.target.value) || 0)}
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <TextField
              label="Min"
              value={String(field.min)}
              onChange={(e) => updateField("min", Number(e.target.value) || 0)}
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <TextField
              label="Max"
              value={String(field.max)}
              onChange={(e) => updateField("max", Number(e.target.value) || 100)}
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <TextField
              label="Step"
              value={String(field.step || 1)}
              onChange={(e) => updateField("step", Number(e.target.value) || 1)}
            />
          </PanelSectionRow>
        </>
      )}

      {field.type === "select" && (
        <>
          <PanelSectionRow>
            <TextField
              label="Initial Value"
              value={field.initialValue}
              onChange={(e) => updateField("initialValue", e.target.value)}
            />
          </PanelSectionRow>

          {field.options.map((opt, optIndex) => (
            <div key={optIndex}>
              <PanelSectionRow>
                <TextField
                  label={`Option ${optIndex + 1} Label`}
                  value={opt.label}
                  onChange={(e) => updateSelectOption(optIndex, "label", e.target.value)}
                />
              </PanelSectionRow>
              <PanelSectionRow>
                <TextField
                  label={`Option ${optIndex + 1} Value`}
                  value={opt.value}
                  onChange={(e) => updateSelectOption(optIndex, "value", e.target.value)}
                />
              </PanelSectionRow>
              <PanelSectionRow>
                <ButtonItem layout="below" onClick={() => removeSelectOption(optIndex)}>
                  <FaTrash style={{ marginRight: "8px" }} />
                  Remove Option {optIndex + 1}
                </ButtonItem>
              </PanelSectionRow>
            </div>
          ))}

          <PanelSectionRow>
            <ButtonItem layout="below" onClick={addSelectOption}>
              <FaPlus style={{ marginRight: "8px" }} />
              Add Option
            </ButtonItem>
          </PanelSectionRow>
        </>
      )}
    </PanelSection>
  );
}
