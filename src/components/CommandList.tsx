import {
  DialogButton,
  Focusable,
  PanelSection,
  PanelSectionRow,
  showModal,
} from "@decky/ui";
import { useCallback, useEffect, useState } from "react";
import { FaFolder, FaPlus, FaSync } from "react-icons/fa";
import {
  deleteCommand,
  getAllInputValues,
  getCommands,
  getCommandsDirPath,
  saveCommand,
  saveInputValues,
} from "../api";
import { CommandConfig, ConfigFieldValues } from "../plugin-types";
import { CommandEditorModal } from "./CommandEditorModal";
import { CommandItem } from "./CommandItem";

export function CommandList() {
  const [commands, setCommands] = useState<CommandConfig[]>([]);
  const [commandsDir, setCommandsDir] = useState<string>("");
  const [configFieldValues, setConfigFieldValues] = useState<
    Record<string, ConfigFieldValues>
  >({});

  const getConfigFieldValues = useCallback(
    (commandId: string): ConfigFieldValues => {
      return configFieldValues[commandId] || {};
    },
    [configFieldValues],
  );

  const saveConfigFieldValues = useCallback(
    (commandId: string, values: ConfigFieldValues) => {
      setConfigFieldValues((prev) => ({
        ...prev,
        [commandId]: values,
      }));
      saveInputValues(commandId, values).catch((error) => {
        console.error("Failed to save input values:", error);
      });
    },
    [],
  );

  const loadCommands = useCallback(async () => {
    try {
      const result = await getCommands();
      setCommands(result.commands || []);
    } catch (error) {
      console.error("Failed to load commands:", error);
    }
  }, []);

  const loadCommandsDir = useCallback(async () => {
    try {
      const dir = await getCommandsDirPath();
      setCommandsDir(dir);
    } catch (error) {
      console.error("Failed to get commands dir:", error);
    }
  }, []);

  const loadInputValues = useCallback(async () => {
    try {
      const values = await getAllInputValues();
      setConfigFieldValues(values);
    } catch (error) {
      console.error("Failed to load input values:", error);
    }
  }, []);

  useEffect(() => {
    loadCommands();
    loadCommandsDir();
    loadInputValues();
  }, [loadCommands, loadCommandsDir, loadInputValues]);

  const handleSave = useCallback(
    async (command: CommandConfig) => {
      try {
        const result = await saveCommand(command);
        if (result.success) {
          await loadCommands();
        } else {
          console.error("Failed to save command:", result.error);
        }
      } catch (error) {
        console.error("Failed to save command:", error);
      }
    },
    [loadCommands],
  );

  const handleEdit = useCallback(
    (command: CommandConfig) => {
      showModal(<CommandEditorModal command={command} onSave={handleSave} />);
    },
    [handleSave],
  );

  const handleNew = useCallback(() => {
    showModal(<CommandEditorModal command={null} onSave={handleSave} />);
  }, [handleSave]);

  const handleDelete = useCallback(
    async (commandId: string) => {
      try {
        const result = await deleteCommand(commandId);
        if (result.success) {
          await loadCommands();
        } else {
          console.error("Failed to delete command:", result.error);
        }
      } catch (error) {
        console.error("Failed to delete command:", error);
      }
    },
    [loadCommands],
  );

  return (
    <>
      <PanelSection title="Commands">
        <PanelSectionRow>
          <Focusable
            flow-children="horizontal"
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 0,
              gap: "8px",
            }}
          >
            <div style={{ flexGrow: 1 }}>
              <DialogButton onClick={handleNew}>
                <FaPlus style={{ marginRight: "8px" }} />
                New Command
              </DialogButton>
            </div>
            <DialogButton
              aria-label="Refresh Commands"
              style={{
                minWidth: 0,
                width: "15%",
                paddingLeft: 0,
                paddingRight: 0,
              }}
              onClick={loadCommands}
            >
              <FaSync />
            </DialogButton>
          </Focusable>
        </PanelSectionRow>
      </PanelSection>

      {commands.length === 0 ? (
        <PanelSection>
          <PanelSectionRow>
            <div
              style={{
                textAlign: "center",
                padding: "12px 0",
                color: "#8b929a",
              }}
            >
              <div>No commands configured.</div>
              <div style={{ fontSize: "12px", marginTop: "8px" }}>
                Click "New Command" to create one, or add JSON files to the
                commands directory.
              </div>
            </div>
          </PanelSectionRow>
        </PanelSection>
      ) : (
        commands.map((command) => (
          <CommandItem
            key={command.id}
            command={command}
            configValues={getConfigFieldValues(command.id)}
            onConfigValuesSave={(values) =>
              saveConfigFieldValues(command.id, values)
            }
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))
      )}

      {commandsDir && (
        <PanelSection title="Commands Directory">
          <PanelSectionRow>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                flexGrow: 1,
                gap: "8px",
                padding: "8px",
                backgroundColor: "#1a1d22",
                borderRadius: "4px",
                fontSize: "11px",
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              <FaFolder style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>{commandsDir}</span>
            </div>
          </PanelSectionRow>
        </PanelSection>
      )}
    </>
  );
}
