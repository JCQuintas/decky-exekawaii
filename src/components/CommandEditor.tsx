import {
  DialogButton,
  Focusable,
  PanelSection,
  PanelSectionRow,
  TextField
} from "@decky/ui";
import { useCallback, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { AppState } from "../hooks/usePersistedState";
import { CommandConfig, ConfigField } from "../plugin-types";
import { ConfigFieldEditor } from "./ConfigFieldEditor";

type EditingDraft = NonNullable<AppState["editingCommandDraft"]>;

interface CommandEditorProps {
  command: CommandConfig | null;
  draft: EditingDraft | null;
  onDraftChange: (draft: Partial<EditingDraft>) => void;
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

  const addConfigField = useCallback((field: string) => {
    onDraftChange({ configFields: [...configFields, createDefaultField(field)] });
  }, [configFields, onDraftChange]);

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
        <TextField
          label="Title"
          value={title}
          onChange={(e) => onDraftChange({ title: e.target.value })}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => onDraftChange({ description: e.target.value })}
        />
        <TextField
          label="Command"
          value={cmd}
          onChange={(e) => onDraftChange({ command: e.target.value })}
        />
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
        <Focusable flow-children="vertical" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 0, gap: "8px" }}>
          {
            FIELD_TYPES.map((ft) => {
              return (
                <DialogButton
                  key={ft.data}
                  onClick={() => addConfigField(ft.data)}
                >
                  {ft.label}
                </DialogButton>
              );
            })
          }
        </Focusable>
      </PanelSection>

      <PanelSection title="Actions">
        <PanelSectionRow>
          <Focusable flow-children="horizontal" style={{ display: "flex", justifyContent: "space-between", padding: 0, gap: "8px" }}>
            <div style={{ flexGrow: 1 }}>
              <DialogButton onClick={handleSave} disabled={!isValid}>
                <FaSave style={{ marginRight: "8px" }} />
                Save
              </DialogButton>
            </div>
            <DialogButton
              aria-label="Cancel"
              style={{ minWidth: 0, width: "15%", paddingLeft: 0, paddingRight: 0, }}
              onClick={onCancel}
            >
              <FaTimes />
            </DialogButton>
          </Focusable>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
}
