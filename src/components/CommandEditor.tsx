import {
  ButtonItem,
  DropdownItem,
  PanelSection,
  PanelSectionRow,
  TextField,
} from "@decky/ui";
import { useCallback, useEffect } from "react";
import { FaPlus, FaSave, FaTimes } from "react-icons/fa";
import { PersistedState } from "../hooks/usePersistedState";
import { CommandConfig, ConfigField } from "../plugin-types";
import { ConfigFieldEditor } from "./ConfigFieldEditor";

type EditingDraft = NonNullable<PersistedState["editingCommandDraft"]>;

interface CommandEditorProps {
  command: CommandConfig | null;
  draft: EditingDraft | null;
  onDraftChange: (draft: Partial<EditingDraft>) => void;
  newFieldType: string;
  onNewFieldTypeChange: (fieldType: string) => void;
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

export function CommandEditor({
  command,
  draft,
  onDraftChange,
  newFieldType,
  onNewFieldTypeChange,
  onSave,
  onCancel,
}: CommandEditorProps) {

  // Use draft values, falling back to command values or empty
  const title = draft?.title ?? command?.title ?? "";
  const description = draft?.description ?? command?.description ?? "";
  const cmd = draft?.command ?? command?.command ?? "";
  const configFields = draft?.configFields ?? command?.configFields ?? [];

  // Initialize draft from command if draft is empty but command exists
  useEffect(() => {
    if (command && !draft) {
      onDraftChange({
        title: command.title,
        description: command.description,
        command: command.command,
        configFields: command.configFields || [],
      });
    }
  }, [command, draft, onDraftChange]);

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
    onDraftChange({ configFields: [...configFields, createDefaultField(newFieldType)] });
  }, [configFields, newFieldType, onDraftChange]);

  const updateConfigField = useCallback((index: number, field: ConfigField) => {
    const newFields = [...configFields];
    newFields[index] = field;
    onDraftChange({ configFields: newFields });
  }, [configFields, onDraftChange]);

  const removeConfigField = useCallback((index: number) => {
    onDraftChange({ configFields: configFields.filter((_, i) => i !== index) });
  }, [configFields, onDraftChange]);

  const isValid = title.trim() && cmd.trim();

  return (
    <>
      <PanelSection title={command ? "Edit Command" : "New Command"}>
        <PanelSectionRow>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => onDraftChange({ title: e.target.value })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <TextField
            label="Description"
            value={description}
            onChange={(e) => onDraftChange({ description: e.target.value })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <TextField
            label="Command"
            value={cmd}
            onChange={(e) => onDraftChange({ command: e.target.value })}
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
            onChange={(opt) => onNewFieldTypeChange(opt.data)}
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
