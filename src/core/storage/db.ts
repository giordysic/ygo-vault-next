import Dexie, { type EntityTable } from 'dexie';
import { DB_NAME, DB_VERSION } from '../constants/storage';
import { V1_SCHEMA } from './migrations/v1';
import type { CollectionEntry } from '../schemas/collection.schemas';
import type { Deck } from '../schemas/deck.schemas';

// ---------------------------------------------------------------------------
// Supplementary table types
// ---------------------------------------------------------------------------

export interface SettingsRecord {
  id: string;
  [key: string]: unknown;
}

export interface MediaAsset {
  mediaId: string;
  entryId?: string;
  type: 'image' | 'thumbnail';
  mimeType: string;
  blob: Blob;
  fileName?: string;
  size: number;
  createdAt: string;
}

export interface PriceHistoryRecord {
  id: string;
  cardId: string;
  price: number;
  currency: string;
  source: string;
  fetchedAt: string;
}

export interface BackupRecord {
  id: string;
  payload: string; // JSON stringified export payload
  size: number;
  createdAt: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  criteria: unknown;
  createdAt: string;
}

export interface AppMetaRecord {
  key: string;
  value: unknown;
}

// ---------------------------------------------------------------------------
// Database class
// ---------------------------------------------------------------------------

export class YgoVaultDB extends Dexie {
  collectionEntries!: EntityTable<CollectionEntry, 'entryId'>;
  decks!: EntityTable<Deck, 'deckId'>;
  settings!: EntityTable<SettingsRecord, 'id'>;
  mediaAssets!: EntityTable<MediaAsset, 'mediaId'>;
  priceHistory!: EntityTable<PriceHistoryRecord, 'id'>;
  backups!: EntityTable<BackupRecord, 'id'>;
  savedFilters!: EntityTable<SavedFilter, 'id'>;
  appMeta!: EntityTable<AppMetaRecord, 'key'>;

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores(V1_SCHEMA);
  }
}

/** Singleton database instance. */
export const db = new YgoVaultDB();
