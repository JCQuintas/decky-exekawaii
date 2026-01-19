import {
  ButtonItem,
  DropdownItem,
  Focusable,
  PanelSection,
  PanelSectionRow,
  TextField,
} from "@decky/ui";
import { useCallback, useEffect, useState } from "react";
import { FaPlus, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import { CommandConfig, ConfigField, SelectOption } from "../types";

interface CommandEditorProps {
  command: CommandConfig | null;
  onSave: (command: CommandConfig) => void;
  onCancel: () => void;
}

const FIELD_TYPES = [
  { label: "Boolean (Switch)", data: "boolean" },
  { label: "Number (Slider)", data: "number" },
  { label: "Select (Dropdown)", data: "select" },
  { label: "Divider", data: "divider" },
];

function createDefaultField(type: string): ConfigField {
  const base = { title: "", description: "" };
  switch (type) {
    case "boolean":
      return { ...base, type: "boolean", envVar: "", initialValue: false };
    case "number":
      return { ...base, type: "number", envVar: "", initialValue: 0, min: 0, max: 100, step: 1 };
    case "select":
      return { ...base, type: "select", envVar: "", initialValue: "", options: [] };
    case "divider":
    default:
      return { ...base, type: "divider" };
  }
}

interface ConfigFieldEditorProps {
  field: ConfigField;
  index: number;
  onChange: (index: number, field: ConfigField) => void;
  onRemove: (index: number) => void;
}

function ConfigFieldEditor({ field, index, onChange, onRemove }: ConfigFieldEditorProps) {
  const updateField = useCallback(
    (key: string, value: any) => onChange(index, { ...field, [key]: value } ),
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
    <Focusable
      style={{
        padding: "12px",
        marginBottom: "8px",
        backgroundColor: "#1a1d22",
        borderRadius: "4px",
      }}
    >
      <Focusable style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontWeight: "bold", textTransform: "capitalize" }}>
          {field.type} Field
        </span>
        <ButtonItem layout="below" onClick={() => onRemove(index)}>
          <FaTrash />
        </ButtonItem>
      </Focusable>

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
            onChange={(e) => updateField("envVar" as keyof ConfigField, e.target.value)}
          />
        </PanelSectionRow>
      )}

      {field.type === "boolean" && (
        <PanelSectionRow>
          <DropdownItem
            label="Initial Value"
            rgOptions={[
              { label: "Off", data: false },
              { label: "On", data: true },
            ]}
            selectedOption={field.initialValue}
            onChange={(opt) => updateField("initialValue" as keyof ConfigField, opt.data)}
          />
        </PanelSectionRow>
      )}

      {field.type === "number" && (
        <>
          <PanelSectionRow>
            <TextField
              label="Initial Value"
              value={String(field.initialValue)}
              onChange={(e) => updateField("initialValue" as keyof ConfigField, Number(e.target.value) || 0)}
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <TextField
              label="Min"
              value={String(field.min)}
              onChange={(e) => updateField("min" as keyof ConfigField, Number(e.target.value) || 0)}
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <TextField
              label="Max"
              value={String(field.max)}
              onChange={(e) => updateField("max" as keyof ConfigField, Number(e.target.value) || 100)}
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <TextField
              label="Step"
              value={String(field.step || 1)}
              onChange={(e) => updateField("step" as keyof ConfigField, Number(e.target.value) || 1)}
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
              onChange={(e) => updateField("initialValue" as keyof ConfigField, e.target.value)}
            />
          </PanelSectionRow>
          <div style={{ marginTop: "8px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Options</div>
            {field.options.map((opt, optIndex) => (
              <Focusable
                key={optIndex}
                style={{ display: "flex", gap: "8px", marginBottom: "4px", alignItems: "center" }}
              >
                <TextField
                  label="Label"
                  value={opt.label}
                  onChange={(e) => updateSelectOption(optIndex, "label", e.target.value)}
                />
                <TextField
                  label="Value"
                  value={opt.value}
                  onChange={(e) => updateSelectOption(optIndex, "value", e.target.value)}
                />
                <ButtonItem layout="below" onClick={() => removeSelectOption(optIndex)}>
                  <FaTrash />
                </ButtonItem>
              </Focusable>
            ))}
            <ButtonItem layout="below" onClick={addSelectOption}>
              <Focusable style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <FaPlus /> Add Option
              </Focusable>
            </ButtonItem>
          </div>
        </>
      )}
    </Focusable>
  );
}

export function CommandEditor({ command, onSave, onCancel }: CommandEditorProps) {
  const [title, setTitle] = useState(command?.title || "");
  const [description, setDescription] = useState(command?.description || "");
  const [cmd, setCmd] = useState(command?.command || "");
  const [configFields, setConfigFields] = useState<ConfigField[]>(
    command?.configFields || []
  );
  const [newFieldType, setNewFieldType] = useState("boolean");

  useEffect(() => {
    if (command) {
      setTitle(command.title);
      setDescription(command.description);
      setCmd(command.command);
      setConfigFields(command.configFields || []);
    } else {
      setTitle("");
      setDescription("");
      setCmd("");
      setConfigFields([]);
    }
  }, [command]);

  const handleSave = useCallback(() => {
    const newCommand: CommandConfig = {
      id: command?.id || "",
      title,
      description,
      command: cmd,
      configFields: configFields.length > 0 ? configFields : undefined,
    };
    onSave(newCommand);
  }, [command?.id, title, description, cmd, configFields, onSave]);

  const addConfigField = useCallback(() => {
    setConfigFields((prev) => [...prev, createDefaultField(newFieldType)]);
  }, [newFieldType]);

  const updateConfigField = useCallback((index: number, field: ConfigField) => {
    setConfigFields((prev) => {
      const newFields = [...prev];
      newFields[index] = field;
      return newFields;
    });
  }, []);

  const removeConfigField = useCallback((index: number) => {
    setConfigFields((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const isValid = title.trim() && cmd.trim();

  return (
    <Focusable style={{ padding: "8px" }}>
      <PanelSection title={command ? "Edit Command" : "New Command"}>
        <PanelSectionRow>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <TextField
            label="Command"
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
          />
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Configuration Fields">
        {configFields.map((field, index) => (
          <ConfigFieldEditor
            key={index}
            field={field}
            index={index}
            onChange={updateConfigField}
            onRemove={removeConfigField}
          />
        ))}

        <Focusable style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <DropdownItem
            label="Field Type"
            rgOptions={FIELD_TYPES}
            selectedOption={newFieldType}
            onChange={(opt) => setNewFieldType(opt.data)}
          />
          <ButtonItem layout="below" onClick={addConfigField}>
            <Focusable style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <FaPlus /> Add Field
            </Focusable>
          </ButtonItem>
        </Focusable>
      </PanelSection>

      <PanelSection>
        <Focusable style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <ButtonItem layout="below" onClick={onCancel}>
            <Focusable style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <FaTimes /> Cancel
            </Focusable>
          </ButtonItem>
          <ButtonItem layout="below" onClick={handleSave} disabled={!isValid}>
            <Focusable style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <FaSave /> Save
            </Focusable>
          </ButtonItem>
        </Focusable>
      </PanelSection>
    </Focusable>
  );
}
