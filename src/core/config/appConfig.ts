export const APP_CONFIG = {
  name: 'YGO Vault Next',
  version: '1.0.0',
  schemaVersion: 1,
  description: 'Yu-Gi-Oh! card collection manager',
  repository: 'https://github.com/ygo-vault/ygo-vault-next',

  defaults: {
    language: 'en',
    currency: 'USD',
    themeId: 'default',
    themeMode: 'dark' as const,
    collectionView: 'grid' as const,
    cardSize: 'normal' as const,
    compactMode: false,
    enableAnimations: true,
    enableHoloFx: true,
    enableHeavyEffects: false,
    autoBackup: true,
    backupRetention: 5,
    analyticsMode: 'simple' as const,
  },

  limits: {
    maxCollectionEntries: 100_000,
    maxDecks: 500,
    maxDeckCards: 60,
    maxSideDeck: 15,
    maxExtraDeck: 15,
    maxTags: 50,
    maxTagLength: 40,
    maxNotesLength: 2000,
    maxNameLength: 200,
    maxImportSize: 50 * 1024 * 1024, // 50 MB
    maxMediaSize: 5 * 1024 * 1024, // 5 MB
    maxThumbnailSize: 256,
  },

  search: {
    debounceMs: 300,
    minQueryLength: 2,
    maxResults: 200,
    fuseThreshold: 0.35,
  },

  pricing: {
    stalePriceThresholdDays: 7,
    currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'] as const,
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
