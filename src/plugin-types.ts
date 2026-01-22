// Configuration field types for the configuration panel

export interface BaseConfigField {
  title: string;
  description?: string;
}

export interface BooleanConfigField extends BaseConfigField {
  type: "boolean";
  envVar: string;
  initialValue: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectConfigField extends BaseConfigField {
  type: "select";
  envVar: string;
  initialValue: string;
  options: SelectOption[];
}

export interface NumberConfigField extends BaseConfigField {
  type: "number";
  envVar: string;
  initialValue: number;
  min: number;
  max: number;
  step?: number;
}

export interface DividerConfigField extends BaseConfigField {
  type: "divider";
}

export type TimeUnit =
  | "nanoseconds"
  | "microseconds"
  | "milliseconds"
  | "seconds"
  | "minutes"
  | "hours"
  | "days";

export interface TimeConfigField extends BaseConfigField {
  type: "time";
  envVar: string;
  initialValue: number;
  min: number;
  max: number;
  step?: number;
  inputUnit: TimeUnit;
  outputUnit: TimeUnit;
}

export type ConfigField =
  | BooleanConfigField
  | SelectConfigField
  | NumberConfigField
  | DividerConfigField
  | TimeConfigField;

// Command configuration
export interface CommandConfig {
  id: string;
  title: string;
  description: string;
  command: string;
  configFields?: ConfigField[];
}

// Runtime state for config field values
export type ConfigFieldValues = Record<string, string | number | boolean>;

// Command execution result
export interface CommandResult {
  success: boolean;
  output: string;
  exitCode: number;
}

// Backend response types
export interface CommandListResponse {
  commands: CommandConfig[];
}
