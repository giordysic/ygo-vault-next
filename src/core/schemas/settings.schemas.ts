import { z } from 'zod';
import { APP_CONFIG } from '../config/appConfig';

export const appSettingsSchema = z.object({
  themeId: z.string().min(1),
  themeMode: z.enum(['light', 'dark']),
  collectionView: z.enum(['grid', 'list']),
  cardSize: z.enum(['compact', 'normal', 'large']),
  compactMode: z.boolean(),
  defaultLanguage: z.string().min(1),
  defaultCurrency: z.string().min(1),
  enableAnimations: z.boolean(),
  enableHoloFx: z.boolean(),
  enableHeavyEffects: z.boolean(),
  autoBackup: z.boolean(),
  backupRetention: z.number().int().min(1).max(100),
  analyticsMode: z.enum(['simple', 'advanced']),
  experimentalFlags: z.array(z.string()),
  updatedAt: z.string(),
});

export type AppSettings = z.infer<typeof appSettingsSchema>;

export function createDefaultSettings(): AppSettings {
  return {
    themeId: APP_CONFIG.defaults.themeId,
    themeMode: APP_CONFIG.defaults.themeMode,
    collectionView: APP_CONFIG.defaults.collectionView,
    cardSize: APP_CONFIG.defaults.cardSize,
    compactMode: APP_CONFIG.defaults.compactMode,
    defaultLanguage: APP_CONFIG.defaults.language,
    defaultCurrency: APP_CONFIG.defaults.currency,
    enableAnimations: APP_CONFIG.defaults.enableAnimations,
    enableHoloFx: APP_CONFIG.defaults.enableHoloFx,
    enableHeavyEffects: APP_CONFIG.defaults.enableHeavyEffects,
    autoBackup: APP_CONFIG.defaults.autoBackup,
    backupRetention: APP_CONFIG.defaults.backupRetention,
    analyticsMode: APP_CONFIG.defaults.analyticsMode,
    experimentalFlags: [],
    updatedAt: new Date().toISOString(),
  };
}
