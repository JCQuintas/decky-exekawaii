import {
  DialogButton,
  Focusable,
  PanelSection,
  PanelSectionRow
} from "@decky/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaChevronDown, FaChevronUp, FaDiceD6, FaEdit, FaTerminal, FaTrash } from "react-icons/fa";
import { executeCommand } from "../api";
import { CommandConfig, CommandResult, ConfigFieldValues } from "../plugin-types";
import { ConfigPanel } from "./ConfigPanel";

interface CommandItemProps {
  command: CommandConfig;
  expanded: boolean;
  configValues: ConfigFieldValues;
  onExpandedChange: (expanded: boolean) => void;
  onConfigValueChange: (envVar: string, value: string | number | boolean) => void;
  onEdit: (command: CommandConfig) => void;
  onDelete: (commandId: string) => void;
}

export function CommandItem({
  command,
  expanded,
  configValues,
  onExpandedChange,
  onConfigValueChange,
  onEdit,
  onDelete,
}: CommandItemProps) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CommandResult | null>(null);

  // Merge persisted values with defaults from config fields
  const mergedConfigValues = useMemo(() => {
    const merged: ConfigFieldValues = {};
    if (command.configFields) {
      for (const field of command.configFields) {
        if (field.type !== "divider" && "envVar" in field) {
          merged[field.envVar] = configValues[field.envVar] ?? field.initialValue;
        }
      }
    }
    return merged;
  }, [command.configFields, configValues]);

  // Initialize persisted values with defaults if not set
  useEffect(() => {
    if (command.configFields) {
      for (const field of command.configFields) {
        if (field.type !== "divider" && "envVar" in field) {
          if (configValues[field.envVar] === undefined) {
            onConfigValueChange(field.envVar, field.initialValue);
          }
        }
      }
    }
  }, [command.configFields, configValues, onConfigValueChange]);

  const hasConfigFields = useMemo(
    () => command.configFields && command.configFields.length > 0,
    [command.configFields]
  );

  const handleRun = useCallback(async () => {
    const timeout = setTimeout(() => {
      setRunning(true);
    }, 200); // Show "Running..." only if it takes more than 200ms
    try {
      const res = await executeCommand(command.id, mergedConfigValues);
      setResult(res);
    } catch (error) {
      setResult({
        success: false,
        output: String(error),
        exitCode: -1,
      });
    } finally {
      clearTimeout(timeout);
      setRunning(false);
    }
  }, [command.id, mergedConfigValues]);

  return (
    <PanelSection>
      {/* Title and description */}
      <PanelSectionRow>
        <div>
          <div style={{ fontWeight: "bold" }}>{command.title}</div>
          {command.description && (
            <div style={{ fontSize: "12px", color: "#8b929a" }}>
              {command.description}
            </div>
          )}
        </div>
      </PanelSectionRow>

      {/* Configuration expand/collapse button */}
      {hasConfigFields && (
        <PanelSectionRow>
          <Focusable flow-children="horizontal" style={{ display: "flex", justifyContent: "center", padding: 0, marginBottom: "8px" }} >
            <DialogButton onClick={() => onExpandedChange(!expanded)}>
              <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaDiceD6 />
                  Input
                </span>
                {expanded ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </DialogButton>
          </Focusable>
        </PanelSectionRow>
      )}

      {/* Expanded configuration panel */}
      {expanded && hasConfigFields && command.configFields && (
        <ConfigPanel
          fields={command.configFields}
          values={mergedConfigValues}
          onChange={onConfigValueChange}
        />
      )}

      {/* Action buttons */}
      <PanelSectionRow>
        <Focusable flow-children="horizontal" style={{ display: "flex", justifyContent: "space-between", padding: 0, gap: "8px" }}>
          <div style={{ flexGrow: 1 }}>
            <DialogButton onClick={handleRun} disabled={running}>
              <FaTerminal style={{ marginRight: "8px" }} />
              {running ? "Running..." : "Run"}
            </DialogButton>
          </div>
          <DialogButton
            aria-label="Edit Command"
            style={{ minWidth: 0, width: "15%", paddingLeft: 0, paddingRight: 0, }}
            onClick={() => onEdit(command)}
          >
            <FaEdit />
          </DialogButton>
          <DialogButton
            aria-label="Delete Command"
            style={{ minWidth: 0, width: "15%", paddingLeft: 0, paddingRight: 0, }}
            onClick={() => onDelete(command.id)}
          >
            <FaTrash />
          </DialogButton>
        </Focusable>
      </PanelSectionRow>

      {/* Result display */}
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
              marginTop: "8px",
            }}
          >
            {result.output && <div>{result.output}</div>}
          </div>
        </PanelSectionRow>
      )}
    </PanelSection>
  );
}
