import { callable } from "@decky/api";
import { CommandConfig, CommandResult, ConfigFieldValues, CommandListResponse } from "./types";

// Backend API calls
export const getCommands = callable<[], CommandListResponse>("get_commands");

export const getCommand = callable<[commandId: string], CommandConfig | null>("get_command");

export const saveCommand = callable<
  [command: CommandConfig],
  { success: boolean; command?: CommandConfig; error?: string }
>("save_command");

export const deleteCommand = callable<
  [commandId: string],
  { success: boolean; error?: string }
>("delete_command");

export const executeCommand = callable<
  [commandId: string, envVars: ConfigFieldValues | null],
  CommandResult
>("execute_command");

export const getCommandsDirPath = callable<[], string>("get_commands_dir_path");
