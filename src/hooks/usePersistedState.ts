import { useCallback, useState } from "react";

const STORAGE_KEY = "exekawaii-state";

export interface AppState {
  view: "list" | "editor";
  editingCommandId: string | null;
  editingCommandDraft: {
    title: string;
    description: string;
    command: string;
    configFields: any[];
  } | null;
  configFieldValues: Record<string, Record<string, string | number | boolean>>;
  expandedCommands: Record<string, boolean>;
}

const DEFAULT_STATE: AppState = {
  view: "list",
  editingCommandId: null,
  editingCommandDraft: null,
  configFieldValues: {},
  expandedCommands: {},
};

export function useAppState() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);



  const setView = useCallback((view: "list" | "editor") => {
    setState((prev) => ({ ...prev, view }));
  }, []);

  const setEditingCommand = useCallback((commandId: string | null, draft: AppState["editingCommandDraft"] = null) => {
    setState((prev) => ({
      ...prev,
      editingCommandId: commandId,
      editingCommandDraft: draft,
    }));
  }, []);

  const updateEditingDraft = useCallback((draft: Partial<NonNullable<AppState["editingCommandDraft"]>>) => {
    setState((prev) => ({
      ...prev,
      editingCommandDraft: prev.editingCommandDraft
        ? { ...prev.editingCommandDraft, ...draft }
        : null,
    }));
  }, []);

  const setConfigFieldValue = useCallback((commandId: string, envVar: string, value: string | number | boolean) => {
    setState((prev) => ({
      ...prev,
      configFieldValues: {
        ...prev.configFieldValues,
        [commandId]: {
          ...prev.configFieldValues[commandId],
          [envVar]: value,
        },
      },
    }));
  }, []);

  const getConfigFieldValues = useCallback((commandId: string): Record<string, string | number | boolean> => {
    return state.configFieldValues[commandId] || {};
  }, [state.configFieldValues]);

  const setExpanded = useCallback((commandId: string, expanded: boolean) => {
    setState((prev) => ({
      ...prev,
      expandedCommands: {
        ...prev.expandedCommands,
        [commandId]: expanded,
      },
    }));
  }, []);

  const isExpanded = useCallback((commandId: string): boolean => {
    return state.expandedCommands[commandId] || false;
  }, [state.expandedCommands]);

  const clearEditingState = useCallback(() => {
    setState((prev) => ({
      ...prev,
      view: "list",
      editingCommandId: null,
      editingCommandDraft: null,
    }));
  }, []);

  const resetState = useCallback(() => {
    setState(DEFAULT_STATE);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    state,
    setView,
    setEditingCommand,
    updateEditingDraft,
    setConfigFieldValue,
    getConfigFieldValues,
    setExpanded,
    isExpanded,
    clearEditingState,
    resetState,
  };
}
