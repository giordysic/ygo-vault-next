import Fuse, { type IFuseOptions } from 'fuse.js';
import type { CollectionEntry } from '../../schemas/collection.schemas';
import { APP_CONFIG } from '../../config/appConfig';

const FUSE_OPTIONS: IFuseOptions<CollectionEntry> = {
  keys: [
    { name: 'name', weight: 2.0 },
    { name: 'localeName', weight: 1.5 },
    { name: 'passcode', weight: 1.0 },
    { name: 'setCode', weight: 1.0 },
    { name: 'setName', weight: 1.0 },
    { name: 'archetype', weight: 0.8 },
    { name: 'typeLine', weight: 0.7 },
    { name: 'rarity', weight: 0.6 },
    { name: 'tags', weight: 0.5 },
    { name: 'notes', weight: 0.3 },
  ],
  threshold: APP_CONFIG.search.fuseThreshold,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: APP_CONFIG.search.minQueryLength,
};

/**
 * Fuse.js-based full-text search service for collection entries.
 * Maintains an internal index that must be rebuilt when the dataset changes.
 */
export class SearchService {
  private fuse: Fuse<CollectionEntry>;
  private entries: CollectionEntry[];

  constructor(entries: CollectionEntry[] = []) {
    this.entries = entries;
    this.fuse = new Fuse(entries, FUSE_OPTIONS);
  }

  /** Rebuild the search index with a fresh dataset. */
  setEntries(entries: CollectionEntry[]): void {
    this.entries = entries;
    this.fuse = new Fuse(entries, FUSE_OPTIONS);
  }

  /** Add entries to the existing index. */
  addEntries(entries: CollectionEntry[]): void {
    for (const entry of entries) {
      this.entries.push(entry);
      this.fuse.add(entry);
    }
  }

  /** Remove an entry from the index by entryId. */
  removeEntry(entryId: string): void {
    const idx = this.entries.findIndex((e) => e.entryId === entryId);
    if (idx !== -1) {
      this.entries.splice(idx, 1);
      this.fuse.removeAt(idx);
    }
  }

  /**
   * Search for entries matching the query string.
   * Returns an empty array if the query is below the minimum length.
   */
  search(query: string, limit?: number): CollectionEntry[] {
    const trimmed = query.trim();
    if (trimmed.length < APP_CONFIG.search.minQueryLength) {
      return [];
    }

    const maxResults = limit ?? APP_CONFIG.search.maxResults;
    const results = this.fuse.search(trimmed, { limit: maxResults });
    return results.map((r) => r.item);
  }

  /** Get the total number of indexed entries. */
  get size(): number {
    return this.entries.length;
  }
}

/** Singleton search service instance. */
export const searchService = new SearchService();
