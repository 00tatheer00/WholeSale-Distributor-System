"use client";

import * as React from "react";
import { updateUiModeAction } from "@/server/actions/settings.actions";

export type UiMode = "SIMPLE" | "FULL";

interface UiModeContextType {
  uiMode: UiMode;
  isSimple: boolean;
  isFull: boolean;
  setUiMode: (mode: UiMode) => void;
  toggleUiMode: () => void;
}

const UiModeContext = React.createContext<UiModeContextType>({
  uiMode: "SIMPLE",
  isSimple: true,
  isFull: false,
  setUiMode: () => {},
  toggleUiMode: () => {},
});

const STORAGE_KEY = "pharmadist_ui_mode";

interface UiModeProviderProps {
  children: React.ReactNode;
  initialMode?: UiMode;
}

export function UiModeProvider({ children, initialMode = "SIMPLE" }: UiModeProviderProps) {
  const [uiMode, setUiModeState] = React.useState<UiMode>(initialMode);
  const [isMounted, setIsMounted] = React.useState(false);

  // Read stored preference immediately upon client hydration
  React.useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as UiMode | null;
      if (stored === "SIMPLE" || stored === "FULL") {
        setUiModeState(stored);
      } else if (initialMode) {
        setUiModeState(initialMode);
        localStorage.setItem(STORAGE_KEY, initialMode);
      }
    } catch (e) {
      // Local storage unavailable or restricted
    }
  }, [initialMode]);

  const setUiMode = React.useCallback((mode: UiMode) => {
    setUiModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      // ignore
    }
    // Sync with database in background
    updateUiModeAction(mode).catch((err) => {
      console.error("Failed to sync uiMode with database:", err);
    });
  }, []);

  const toggleUiMode = React.useCallback(() => {
    const nextMode = uiMode === "SIMPLE" ? "FULL" : "SIMPLE";
    setUiMode(nextMode);
  }, [uiMode, setUiMode]);

  const value = React.useMemo<UiModeContextType>(
    () => ({
      uiMode,
      isSimple: uiMode === "SIMPLE",
      isFull: uiMode === "FULL",
      setUiMode,
      toggleUiMode,
    }),
    [uiMode, setUiMode, toggleUiMode]
  );

  return <UiModeContext.Provider value={value}>{children}</UiModeContext.Provider>;
}

export function useUiMode() {
  const context = React.useContext(UiModeContext);
  if (!context) {
    throw new Error("useUiMode must be used within a UiModeProvider");
  }
  return context;
}
