/**
 * Table name constants for the Dexie database.
 * Keep in sync with db.ts schema definitions.
 */
export const TABLES = {
  COLLECTION_ENTRIES: 'collectionEntries',
  DECKS: 'decks',
  SETTINGS: 'settings',
  MEDIA_ASSETS: 'mediaAssets',
  PRICE_HISTORY: 'priceHistory',
  BACKUPS: 'backups',
  SAVED_FILTERS: 'savedFilters',
  APP_META: 'appMeta',
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];
