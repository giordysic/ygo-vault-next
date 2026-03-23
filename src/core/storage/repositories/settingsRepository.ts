import { db } from '@/core/storage/db';
import type { AppSettings } from '@/core/schemas/settings.schemas';
import { createDefaultSettings } from '@/core/schemas/settings.schemas';

const SETTINGS_KEY = 'app-settings';

export const settingsRepository = {
  async load(): Promise<AppSettings> {
    const record = await db.settings.get(SETTINGS_KEY);
    if (!record) {
      return createDefaultSettings();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _key, ...rest } = record;
    return rest as unknown as AppSettings;
  },

  async save(settings: AppSettings): Promise<void> {
    await db.settings.put({ id: SETTINGS_KEY, ...settings });
  },

  async reset(): Promise<void> {
    await db.settings.delete(SETTINGS_KEY);
  },
};
