import { create } from 'zustand';
import type { AppSettings } from '@/core/schemas/settings.schemas';
import { createDefaultSettings } from '@/core/schemas/settings.schemas';
import { settingsRepository } from '@/core/storage/repositories/settingsRepository';
import { applyTheme } from '@/core/theme/registry';
import type { ThemeId, ThemeMode } from '@/core/theme/registry';

interface SettingsState {
  settings: AppSettings;
  hydrated: boolean;
}

interface SettingsActions {
  hydrate: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
  settings: createDefaultSettings(),
  hydrated: false,

  async hydrate() {
    const settings = await settingsRepository.load();
    applyTheme(settings.themeId as ThemeId, settings.themeMode as ThemeMode);
    set({ settings, hydrated: true });
  },

  async updateSettings(partial) {
    const current = get().settings;
    const updated: AppSettings = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    // Apply theme change immediately if theme-related fields changed
    if (partial.themeId !== undefined || partial.themeMode !== undefined) {
      applyTheme(updated.themeId as ThemeId, updated.themeMode as ThemeMode);
    }

    set({ settings: updated });
    await settingsRepository.save(updated);
  },

  async resetSettings() {
    const defaults = createDefaultSettings();
    applyTheme(defaults.themeId as ThemeId, defaults.themeMode as ThemeMode);
    set({ settings: defaults });
    await settingsRepository.reset();
    await settingsRepository.save(defaults);
  },
}));
