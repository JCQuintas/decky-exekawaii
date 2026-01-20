import { useCallback, useState } from "react";

export interface AppState {
  configFieldValues: Record<string, Record<string, string | number | boolean>>;
}

const DEFAULT_STATE: AppState = {
  configFieldValues: {},
};

export function useAppState() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);

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

  const resetState = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  return {
    state,
    setConfigFieldValue,
    getConfigFieldValues,
    resetState,
  };
}
