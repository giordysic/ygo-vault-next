import { importPayloadSchema, type ImportPayload, type ImportResult } from '../../schemas/import.schemas';
import type { CollectionEntry } from '../../schemas/collection.schemas';
import type { Deck } from '../../schemas/deck.schemas';
import { detectLegacyFormat, extractLegacyRecords, mapLegacyCollection } from './legacyAdapter';
import { collectionRepository } from '../../storage/repositories/collectionRepository';
import { deckRepository } from '../../storage/repositories/deckRepository';
import { settingsRepository } from '../../storage/repositories/settingsRepository';
import { APP_CONFIG } from '../../config/appConfig';
import type { ImportStrategy } from '../../types/common';
import { nowISO } from '../../utils/dates';
import { createError } from '../../utils/errors';

/**
 * Service for importing collection data from JSON.
 */
export const importService = {
  /**
   * Parse and validate an import payload from a JSON string.
   */
  parsePayload(jsonString: string): ImportPayload {
    if (jsonString.length > APP_CONFIG.limits.maxImportSize) {
      throw createError('LIMIT_EXCEEDED', 'Import file exceeds maximum allowed size');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw createError('IMPORT', 'Invalid JSON format');
    }

    const result = importPayloadSchema.safeParse(parsed);
    if (!result.success) {
      throw createError('VALIDATION', 'Import data does not match expected schema', result.error);
    }

    return result.data;
  },

  /**
   * Attempt to adapt a legacy/foreign JSON format to the current payload schema.
   * Returns null if the data cannot be adapted.
   */
  adaptLegacyPayload(data: unknown): ImportPayload | null {
    if (!data || typeof data !== 'object') return null;

    const obj = data as Record<string, unknown>;

    // Use the dedicated legacy adapter for proper field mapping
    const detection = detectLegacyFormat(data);
    if (detection.isLegacy) {
      const records = extractLegacyRecords(data);
      if (records && records.length > 0) {
        const { entries } = mapLegacyCollection(records);

        const decks = (obj['decks'] as Deck[] | undefined) ?? undefined;

        const adapted: ImportPayload = {
          metadata: {
            appVersion: (obj['version'] as string) ?? 'legacy',
            schemaVersion: 0,
            exportedAt: (obj['exportedAt'] as string) ?? nowISO(),
            entryCount: entries.length,
            deckCount: decks?.length,
          },
          collectionEntries: entries,
          decks,
        };

        const result = importPayloadSchema.safeParse(adapted);
        return result.success ? result.data : null;
      }
    }

    // Handle case where data is a bare array of entries (already in correct format)
    if (Array.isArray(data)) {
      const adapted: ImportPayload = {
        metadata: {
          appVersion: 'legacy',
          schemaVersion: 0,
          exportedAt: nowISO(),
          entryCount: data.length,
        },
        collectionEntries: data as CollectionEntry[],
      };
      const result = importPayloadSchema.safeParse(adapted);
      return result.success ? result.data : null;
    }

    // Handle legacy format with different field names (already in correct schema)
    if (obj['cards'] || obj['collection'] || obj['entries']) {
      const entries = (obj['cards'] ?? obj['collection'] ?? obj['entries']) as CollectionEntry[];
      const decks = (obj['decks'] as Deck[] | undefined) ?? undefined;

      const adapted: ImportPayload = {
        metadata: {
          appVersion: (obj['version'] as string) ?? 'legacy',
          schemaVersion: (obj['schemaVersion'] as number) ?? 0,
          exportedAt: (obj['exportedAt'] as string) ?? nowISO(),
          entryCount: entries?.length,
          deckCount: decks?.length,
        },
        collectionEntries: entries,
        decks,
      };

      const result = importPayloadSchema.safeParse(adapted);
      return result.success ? result.data : null;
    }

    return null;
  },

  /**
   * Import data using the specified strategy.
   *
   * - `merge`: Add entries that do not already exist (matched by entryId).
   * - `replace`: Clear existing data and import everything.
   */
  async importData(
    payload: ImportPayload,
    strategy: ImportStrategy = 'merge',
  ): Promise<ImportResult> {
    const result: ImportResult = {
      entriesImported: 0,
      entriesSkipped: 0,
      decksImported: 0,
      decksSkipped: 0,
      settingsImported: false,
      warnings: [],
    };

    // Check schema version compatibility
    if (payload.metadata.schemaVersion > APP_CONFIG.schemaVersion) {
      throw createError(
        'SCHEMA_MISMATCH',
        `Import schema version ${payload.metadata.schemaVersion} is newer than app schema version ${APP_CONFIG.schemaVersion}. Please update the app.`,
      );
    }

    try {
      if (strategy === 'replace') {
        await this.importReplace(payload, result);
      } else {
        await this.importMerge(payload, result);
      }

      // Import settings if present
      if (payload.settings) {
        await settingsRepository.save(payload.settings);
        result.settingsImported = true;
      }
    } catch (err) {
      if ((err as { code?: string }).code) throw err;
      throw createError('IMPORT', `Import failed: ${(err as Error).message}`, err);
    }

    return result;
  },

  /** Replace strategy: clear and re-import. */
  async importReplace(payload: ImportPayload, result: ImportResult): Promise<void> {
    // Clear existing data
    if (payload.collectionEntries) {
      await collectionRepository.clear();
      await collectionRepository.bulkAdd(payload.collectionEntries);
      result.entriesImported = payload.collectionEntries.length;
    }

    if (payload.decks) {
      await deckRepository.clear();
      await deckRepository.bulkAdd(payload.decks);
      result.decksImported = payload.decks.length;
    }
  },

  /** Merge strategy: skip entries that already exist by primary key. */
  async importMerge(payload: ImportPayload, result: ImportResult): Promise<void> {
    if (payload.collectionEntries?.length) {
      const existingIds = new Set(
        (await collectionRepository.getAll()).map((e) => e.entryId),
      );

      const newEntries = payload.collectionEntries.filter((e) => {
        if (existingIds.has(e.entryId)) {
          result.entriesSkipped++;
          return false;
        }
        return true;
      });

      if (newEntries.length > 0) {
        await collectionRepository.bulkAdd(newEntries);
        result.entriesImported = newEntries.length;
      }
    }

    if (payload.decks?.length) {
      const existingIds = new Set(
        (await deckRepository.getAll()).map((d) => d.deckId),
      );

      const newDecks = payload.decks.filter((d) => {
        if (existingIds.has(d.deckId)) {
          result.decksSkipped++;
          return false;
        }
        return true;
      });

      if (newDecks.length > 0) {
        await deckRepository.bulkAdd(newDecks);
        result.decksImported = newDecks.length;
      }
    }
  },
};
