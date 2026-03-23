import { APP_CONFIG } from '../../config/appConfig';
import { collectionRepository } from '../../storage/repositories/collectionRepository';
import { deckRepository } from '../../storage/repositories/deckRepository';
import { settingsRepository } from '../../storage/repositories/settingsRepository';
import { nowISO } from '../../utils/dates';
import type { ExportPayload } from '../../schemas/import.schemas';
import { createError } from '../../utils/errors';

export interface ExportOptions {
  includeCollection?: boolean;
  includeDecks?: boolean;
  includeSettings?: boolean;
}

/**
 * Service for exporting collection data to a JSON blob.
 */
export const exportService = {
  /**
   * Build the full export payload.
   */
  async buildPayload(options: ExportOptions = {}): Promise<ExportPayload> {
    const {
      includeCollection = true,
      includeDecks = true,
      includeSettings = true,
    } = options;

    const [collectionEntries, decks, settings] = await Promise.all([
      includeCollection ? collectionRepository.getAll() : undefined,
      includeDecks ? deckRepository.getAll() : undefined,
      includeSettings ? settingsRepository.load() : undefined,
    ]);

    const payload: ExportPayload = {
      metadata: {
        appVersion: APP_CONFIG.version,
        schemaVersion: APP_CONFIG.schemaVersion,
        exportedAt: nowISO(),
        entryCount: collectionEntries?.length,
        deckCount: decks?.length,
      },
      collectionEntries: collectionEntries ?? undefined,
      decks: decks ?? undefined,
      settings: settings ?? undefined,
    };

    return payload;
  },

  /**
   * Export data as a JSON Blob suitable for download.
   */
  async exportToBlob(options?: ExportOptions): Promise<Blob> {
    try {
      const payload = await this.buildPayload(options);
      const json = JSON.stringify(payload, null, 2);
      return new Blob([json], { type: 'application/json' });
    } catch (err) {
      throw createError('EXPORT', `Export failed: ${(err as Error).message}`, err);
    }
  },

  /**
   * Export data and trigger a file download in the browser.
   */
  async downloadExport(options?: ExportOptions): Promise<void> {
    const blob = await this.exportToBlob(options);
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `ygo-vault-export-${timestamp}.json`;

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    // Cleanup
    URL.revokeObjectURL(url);
  },
};
