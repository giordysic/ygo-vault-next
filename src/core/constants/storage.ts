export const DB_NAME = 'ygo-vault-next';
export const DB_VERSION = 1;

export const STORAGE_KEYS = {
  SETTINGS: 'ygo-vault-settings',
  THEME_MODE: 'ygo-vault-theme-mode',
  LAST_BACKUP: 'ygo-vault-last-backup',
  ONBOARDING_COMPLETE: 'ygo-vault-onboarding-complete',
  SIDEBAR_COLLAPSED: 'ygo-vault-sidebar-collapsed',
  LAST_EXPORT_DATE: 'ygo-vault-last-export',
  SEARCH_HISTORY: 'ygo-vault-search-history',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
