import {
  ButtonItem,
  DropdownItem,
  PanelSection,
  PanelSectionRow,
  TextField,
} from "@decky/ui";
import { useCallback, useEffect, useState } from "react";
import { FaPlus, FaSave, FaTimes } from "react-icons/fa";
import { CommandConfig, ConfigField } from "../plugin-types";
import { ConfigFieldEditor } from "./ConfigFieldEditor";

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
