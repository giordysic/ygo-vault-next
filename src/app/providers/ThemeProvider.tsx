// ==========================================================================
// Theme Provider
// React context that bridges Zustand settings store with the CSS theme system.
// ==========================================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useSettingsStore } from '@/features/settings/store';
import {
  applyTheme,
  defaultThemeId,
  defaultThemeMode,
  type ThemeId,
  type ThemeMode,
} from '@/core/theme/registry';

interface ThemeContextValue {
  themeId: ThemeId;
  themeMode: ThemeMode;
  setTheme: (id: ThemeId, mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const themeId = (settings?.themeId as ThemeId) ?? defaultThemeId;
  const themeMode = (settings?.themeMode as ThemeMode) ?? defaultThemeMode;

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    applyTheme(themeId, themeMode);
  }, [themeId, themeMode]);

  const setTheme = useCallback(
    (id: ThemeId, mode: ThemeMode) => {
      updateSettings({ themeId: id, themeMode: mode });
    },
    [updateSettings],
  );

  const toggleMode = useCallback(() => {
    const nextMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    updateSettings({ themeMode: nextMode });
  }, [themeMode, updateSettings]);

  const value = useMemo<ThemeContextValue>(
    () => ({ themeId, themeMode, setTheme, toggleMode }),
    [themeId, themeMode, setTheme, toggleMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
