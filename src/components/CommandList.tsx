import {
  ButtonItem,
  Focusable,
  PanelSection,
  PanelSectionRow,
  Spinner,
} from "@decky/ui";
import { useCallback, useEffect, useState } from "react";
import { FaFolder, FaPlus, FaSync } from "react-icons/fa";
import { deleteCommand, getCommands, getCommandsDirPath, saveCommand } from "../api";
import { CommandConfig } from "../plugin-types";
import { CommandEditor } from "./CommandEditor";
import { CommandItem } from "./CommandItem";

type View = "list" | "editor";

export function CommandList() {
  const [commands, setCommands] = useState<CommandConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("list");
  const [editingCommand, setEditingCommand] = useState<CommandConfig | null>(null);
  const [commandsDir, setCommandsDir] = useState<string>("");

  const loadCommands = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCommands();
      setCommands(result.commands || []);
    } catch (error) {
      console.error("Failed to load commands:", error);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    loadCommands();
    loadCommandsDir();
  }, [loadCommands, loadCommandsDir]);

  const handleEdit = useCallback((command: CommandConfig) => {
    setEditingCommand(command);
    setView("editor");
  }, []);

  const handleNew = useCallback(() => {
    setEditingCommand(null);
    setView("editor");
  }, []);

  const handleSave = useCallback(
    async (command: CommandConfig) => {
      try {
        const result = await saveCommand(command);
        if (result.success) {
          await loadCommands();
          setView("list");
          setEditingCommand(null);
        } else {
          console.error("Failed to save command:", result.error);
        }
      } catch (error) {
        console.error("Failed to save command:", error);
      }
    },
    [loadCommands]
  );

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
    [loadCommands]
  );

  const handleCancel = useCallback(() => {
    setView("list");
    setEditingCommand(null);
  }, []);

  if (view === "editor") {
    return (
      <CommandEditor
        command={editingCommand}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  if (loading) {
    return (
      <PanelSection>
        <PanelSectionRow>
          <Focusable style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
            <Spinner />
          </Focusable>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  return (
    <>
      <PanelSection title="Commands">
        <PanelSectionRow>
          <ButtonItem layout="inline" onClick={handleNew}>
            <FaPlus style={{ marginRight: "8px" }} />
            New Command
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="inline" onClick={loadCommands}>
            <FaSync style={{ marginRight: "8px" }} />
            Refresh
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      {commands.length === 0 ? (
        <PanelSection>
          <PanelSectionRow>
            <div style={{ textAlign: "center", padding: "12px 0", color: "#8b929a" }}>
              <div>No commands configured.</div>
              <div style={{ fontSize: "12px", marginTop: "8px" }}>
                Click "New Command" to create one, or add JSON files to the commands directory.
              </div>
            </div>
          </PanelSectionRow>
        </PanelSection>
      ) : (
        commands.map((command) => (
          <CommandItem
            key={command.id}
            command={command}
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
