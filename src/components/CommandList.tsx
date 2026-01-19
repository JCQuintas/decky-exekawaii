import { useState, useEffect, useCallback } from "react";
import {
  PanelSection,
  PanelSectionRow,
  ButtonItem,
  Focusable,
  Spinner,
} from "@decky/ui";
import { FaPlus, FaSync, FaFolder } from "react-icons/fa";
import { CommandConfig } from "../types";
import { getCommands, saveCommand, deleteCommand, getCommandsDirPath } from "../api";
import { CommandItem } from "./CommandItem";
import { CommandEditor } from "./CommandEditor";

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
    <Focusable>
      <PanelSection title="Commands">
        <PanelSectionRow>
          <Focusable style={{ display: "flex", gap: "8px" }}>
            <ButtonItem layout="below" onClick={handleNew}>
              <Focusable style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <FaPlus /> New Command
              </Focusable>
            </ButtonItem>
            <ButtonItem layout="below" onClick={loadCommands}>
              <Focusable style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <FaSync /> Refresh
              </Focusable>
            </ButtonItem>
          </Focusable>
        </PanelSectionRow>
      </PanelSection>

      {commands.length === 0 ? (
        <PanelSection>
          <PanelSectionRow>
            <Focusable style={{ textAlign: "center", padding: "20px", color: "#8b929a" }}>
              <div>No commands configured.</div>
              <div style={{ fontSize: "12px", marginTop: "8px" }}>
                Click "New Command" to create one, or add JSON files to:
              </div>
            </Focusable>
          </PanelSectionRow>
          {commandsDir && (
            <PanelSectionRow>
              <Focusable
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px",
                  backgroundColor: "#1a1d22",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                }}
              >
                <FaFolder />
                <span>{commandsDir}</span>
              </Focusable>
            </PanelSectionRow>
          )}
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

      {commandsDir && commands.length > 0 && (
        <PanelSection title="Commands Directory">
          <PanelSectionRow>
            <Focusable
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px",
                backgroundColor: "#1a1d22",
                borderRadius: "4px",
                fontSize: "11px",
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              <FaFolder />
              <span>{commandsDir}</span>
            </Focusable>
          </PanelSectionRow>
        </PanelSection>
      )}
    </Focusable>
  );
}
