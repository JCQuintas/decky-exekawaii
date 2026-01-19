import {
  ButtonItem,
  DropdownItem,
  PanelSection,
  PanelSectionRow,
  TextField,
} from "@decky/ui";
import { useCallback, useEffect, useState } from "react";
import { FaPlus, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import { CommandConfig, ConfigField, SelectOption } from "../plugin-types";

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
          <DropdownItem
            label="Initial Value"
            rgOptions={[
              { label: "Off", data: false },
              { label: "On", data: true },
            ]}
            selectedOption={field.initialValue}
            onChange={(opt) => updateField("initialValue", opt.data)}
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
    <>
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

      {configFields.map((field, index) => (
        <ConfigFieldEditor
          key={index}
          field={field}
          index={index}
          onChange={updateConfigField}
          onRemove={removeConfigField}
        />
      ))}

      <PanelSection title="Add Configuration Field">
        <PanelSectionRow>
          <DropdownItem
            label="Field Type"
            rgOptions={FIELD_TYPES}
            selectedOption={newFieldType}
            onChange={(opt) => setNewFieldType(opt.data)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={addConfigField}>
            <FaPlus style={{ marginRight: "8px" }} />
            Add Field
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Actions">
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={handleSave} disabled={!isValid}>
            <FaSave style={{ marginRight: "8px" }} />
            Save
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={onCancel}>
            <FaTimes style={{ marginRight: "8px" }} />
            Cancel
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
}
