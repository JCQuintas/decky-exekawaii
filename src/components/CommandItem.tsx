import {
  ButtonItem,
  DialogButton,
  Focusable,
  PanelSection,
  PanelSectionRow,
} from "@decky/ui";
import { useCallback, useMemo, useState } from "react";
import { FaChevronDown, FaChevronRight, FaEdit, FaPlay, FaTrash } from "react-icons/fa";
import { executeCommand } from "../api";
import { CommandConfig, CommandResult, ConfigFieldValues } from "../plugin-types";
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
      <PanelSectionRow>
        <Focusable
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: hasConfigFields ? "pointer" : "default",
          }}
          onClick={hasConfigFields ? () => setExpanded(!expanded) : undefined}
        >
          {hasConfigFields && (
            <span style={{ fontSize: "12px" }}>
              {expanded ? <FaChevronDown /> : <FaChevronRight />}
            </span>
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
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem layout="inline" onClick={handleRun} disabled={running}>
          <FaPlay style={{ marginRight: "8px" }} />
          {running ? "Running..." : "Run"}
        </ButtonItem>
        <DialogButton
          aria-label="Edit Command"
          style={{ marginLeft: "8px" }}
          onClick={() => onEdit(command)}
        >
          <FaEdit />
        </DialogButton>
        <DialogButton
          aria-label="Delete Command"
          style={{ marginLeft: "8px" }}
          onClick={() => onDelete(command.id)}
        >
          <FaTrash />
        </DialogButton>
      </PanelSectionRow>
      
      {expanded && hasConfigFields && command.configFields && (
        <ConfigPanel
          fields={command.configFields}
          values={configValues}
          onChange={handleConfigChange}
        />
      )}

      {result && (
        <PanelSectionRow>
          <div
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
              width: "100%",
            }}
          >
            <div style={{ marginBottom: "4px" }}>
              Exit code: {result.exitCode}
            </div>
            {result.output && <div>{result.output}</div>}
          </div>
        </PanelSectionRow>
      )}
    </PanelSection>
  );
}
