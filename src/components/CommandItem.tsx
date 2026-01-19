import {
  ButtonItem,
  Focusable,
  PanelSection,
} from "@decky/ui";
import { useCallback, useMemo, useState } from "react";
import { FaChevronDown, FaChevronRight, FaEdit, FaPlay, FaTrash } from "react-icons/fa";
import { executeCommand } from "../api";
import { CommandConfig, CommandResult, ConfigFieldValues } from "../types";
import { ConfigPanel } from "./ConfigPanel";

interface CommandItemProps {
  command: CommandConfig;
  onEdit: (command: CommandConfig) => void;
  onDelete: (commandId: string) => void;
}

export function CommandItem({ command, onEdit, onDelete }: CommandItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CommandResult | null>(null);
  const [configValues, setConfigValues] = useState<ConfigFieldValues>(() => {
    // Initialize with default values from config fields
    const initial: ConfigFieldValues = {};
    if (command.configFields) {
      for (const field of command.configFields) {
        if (field.type !== "divider" && "envVar" in field) {
          initial[field.envVar] = field.initialValue;
        }
      }
    }
    return initial;
  });

  const hasConfigFields = useMemo(
    () => command.configFields && command.configFields.length > 0,
    [command.configFields]
  );

  const handleConfigChange = useCallback(
    (envVar: string, value: string | number | boolean) => {
      setConfigValues((prev) => ({ ...prev, [envVar]: value }));
    },
    []
  );

  const handleRun = useCallback(async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await executeCommand(command.id, configValues);
      setResult(res);
    } catch (error) {
      setResult({
        success: false,
        output: String(error),
        exitCode: -1,
      });
    } finally {
      setRunning(false);
    }
  }, [command.id, configValues]);

  return (
    <PanelSection>
      <Focusable
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "8px 0",
        }}
      >
        {/* Header with title and action buttons */}
        <Focusable
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {hasConfigFields && (
            <Focusable
              style={{
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <FaChevronDown /> : <FaChevronRight />}
            </Focusable>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold" }}>{command.title}</div>
            {command.description && (
              <div style={{ fontSize: "12px", color: "#8b929a" }}>
                {command.description}
              </div>
            )}
          </div>
        </Focusable>

        {/* Action buttons */}
        <Focusable
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
          }}
        >
          <ButtonItem
            layout="below"
            onClick={handleRun}
            disabled={running}
          >
            <Focusable style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <FaPlay />
              <span>{running ? "Running..." : "Run"}</span>
            </Focusable>
          </ButtonItem>
          <ButtonItem
            layout="below"
            onClick={() => onEdit(command)}
          >
            <FaEdit />
          </ButtonItem>
          <ButtonItem
            layout="below"
            onClick={() => onDelete(command.id)}
          >
            <FaTrash />
          </ButtonItem>
        </Focusable>

        {/* Expanded configuration panel */}
        {expanded && hasConfigFields && command.configFields && (
          <ConfigPanel
            fields={command.configFields}
            values={configValues}
            onChange={handleConfigChange}
          />
        )}

        {/* Result display */}
        {result && (
          <Focusable
            style={{
              padding: "8px",
              backgroundColor: result.success ? "#1a472a" : "#4a1a1a",
              borderRadius: "4px",
              fontSize: "12px",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              maxHeight: "150px",
              overflow: "auto",
            }}
          >
            <div style={{ marginBottom: "4px" }}>
              Exit code: {result.exitCode}
            </div>
            {result.output && <div>{result.output}</div>}
          </Focusable>
        )}
      </Focusable>
    </PanelSection>
  );
}
