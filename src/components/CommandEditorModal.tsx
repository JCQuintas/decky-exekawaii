import {
  DialogBody,
  DialogButton,
  DialogHeader,
  Focusable,
  ModalRoot,
  PanelSection,
  TextField,
} from "@decky/ui";
import { useCallback, useState } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { CommandConfig, ConfigField } from "../plugin-types";
import { ConfigFieldEditor } from "./ConfigFieldEditor";

interface CommandEditorModalProps {
  command: CommandConfig | null;
  onSave: (command: CommandConfig) => void;
  closeModal?: () => void;
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
      return {
        ...base,
        type: "number",
        envVar: "",
        initialValue: 0,
        min: 0,
        max: 100,
        step: 1,
      };
    case "select":
      return {
        ...base,
        type: "select",
        envVar: "",
        initialValue: "",
        options: [],
      };
    case "divider":
    default:
      return { ...base, type: "divider" };
  }
}

export function CommandEditorModal({
  command,
  onSave,
  ...props
}: CommandEditorModalProps) {
  const { closeModal } = props;
  const [title, setTitle] = useState(command?.title ?? "");
  const [description, setDescription] = useState(command?.description ?? "");
  const [cmd, setCmd] = useState(command?.command ?? "");
  const [configFields, setConfigFields] = useState<ConfigField[]>(
    command?.configFields ?? [],
  );

  const handleSave = useCallback(() => {
    const newCommand: CommandConfig = {
      id: command?.id || "",
      title,
      description,
      command: cmd,
      configFields: configFields.length > 0 ? configFields : undefined,
    };
    onSave(newCommand);
    closeModal?.();
  }, [command?.id, title, description, cmd, configFields, onSave, closeModal]);

  const handleCancel = useCallback(() => {
    closeModal?.();
  }, [closeModal]);

  const addConfigField = useCallback((fieldType: string) => {
    setConfigFields((prev) => [...prev, createDefaultField(fieldType)]);
  }, []);

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
    <ModalRoot {...props}>
      <DialogHeader>{command ? "Edit Command" : "New Command"}</DialogHeader>
      <DialogBody>
        <Focusable>
          <PanelSection title="Command Details">
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
              label="Command"
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
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

          <PanelSection title="Add Input Field">
            <Focusable
              flow-children="vertical"
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {FIELD_TYPES.map((ft) => (
                <DialogButton
                  key={ft.data}
                  onClick={() => addConfigField(ft.data)}
                >
                  {ft.label}
                </DialogButton>
              ))}
            </Focusable>
          </PanelSection>

          <PanelSection title="Actions">
            <Focusable
              flow-children="horizontal"
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <div style={{ flexGrow: 1 }}>
                <DialogButton onClick={handleSave} disabled={!isValid}>
                  <FaSave style={{ marginRight: "8px" }} />
                  Save
                </DialogButton>
              </div>
              <DialogButton
                aria-label="Cancel"
                style={{
                  minWidth: 0,
                  width: "15%",
                  paddingLeft: 0,
                  paddingRight: 0,
                }}
                onClick={handleCancel}
              >
                <FaTimes />
              </DialogButton>
            </Focusable>
          </PanelSection>
        </Focusable>
      </DialogBody>
    </ModalRoot>
  );
}
