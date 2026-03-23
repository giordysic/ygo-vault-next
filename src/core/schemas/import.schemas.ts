import { z } from 'zod';
import { collectionEntrySchema } from './collection.schemas';
import { deckSchema } from './deck.schemas';
import { appSettingsSchema } from './settings.schemas';

/** Metadata included in every export payload. */
export const exportMetadataSchema = z.object({
  appVersion: z.string(),
  schemaVersion: z.number().int(),
  exportedAt: z.string(),
  entryCount: z.number().int().optional(),
  deckCount: z.number().int().optional(),
});

export type ExportMetadata = z.infer<typeof exportMetadataSchema>;

/** Full export payload. */
export const exportPayloadSchema = z.object({
  metadata: exportMetadataSchema,
  collectionEntries: z.array(collectionEntrySchema).optional(),
  decks: z.array(deckSchema).optional(),
  settings: appSettingsSchema.optional(),
});

export type ExportPayload = z.infer<typeof exportPayloadSchema>;

/** Import payload: same structure as export, validated on ingest. */
export const importPayloadSchema = exportPayloadSchema;

export type ImportPayload = z.infer<typeof importPayloadSchema>;

/** Result of an import operation. */
export interface ImportResult {
  entriesImported: number;
  entriesSkipped: number;
  decksImported: number;
  decksSkipped: number;
  settingsImported: boolean;
  warnings: string[];
}
