/**
 * Legacy Import Adapter
 * Handles the ygo_backupV10 format and maps it to the current app schema.
 */

import type { CollectionEntry } from '../../schemas/collection.schemas';
import { createEntryId } from '../../types/ids';
import { nowISO } from '../../utils/dates';

// ---------------------------------------------------------------------------
// Legacy record type (loosely typed to handle all variations)
// ---------------------------------------------------------------------------

interface LegacyRecord {
  id?: string;
  name?: string;
  customTitle?: string;
  enName?: string;
  passcode?: string;
  qty?: number;
  lang?: string;
  language?: string;
  edition?: string;
  setCode?: string;
  setName?: string;
  rarity?: string;
  mdRarity?: string;
  condition?: string;
  location?: string;
  section?: string;
  sectionResolved?: string;
  typeLine?: string;
  archetype?: string;
  tags?: string[];
  notes?: string;
  priceEUR?: number;
  priceUSD?: number;
  marketPrice?: number;
  artworkId?: string;
  itImageOverride?: string;
  artLocalThumb?: string;
  artLocalFull?: string;
  artStatus?: string;
  artSource?: string;
  imageMode?: string;
  customImageId?: string;
  wishlist?: boolean;
  desiredQty?: number;
  frameType?: string;
  attribute?: string;
  levelRankLink?: number;
  atk?: number;
  def?: number;
  finishType?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

export interface LegacyDetectionResult {
  isLegacy: boolean;
  format: 'ygo-vault-v10' | 'ygo-vault-generic' | 'bare-array' | 'unknown';
  recordCount: number;
  sampleFields: string[];
}

export function detectLegacyFormat(data: unknown): LegacyDetectionResult {
  if (!data || typeof data !== 'object') {
    return { isLegacy: false, format: 'unknown', recordCount: 0, sampleFields: [] };
  }

  // Bare array of records
  if (Array.isArray(data)) {
    const sample = data[0];
    const fields = sample && typeof sample === 'object' ? Object.keys(sample) : [];
    return {
      isLegacy: true,
      format: 'bare-array',
      recordCount: data.length,
      sampleFields: fields.slice(0, 15),
    };
  }

  const obj = data as Record<string, unknown>;

  // ygo_backupV10 format: has 'collection' key with array
  if (obj['collection'] && Array.isArray(obj['collection'])) {
    const records = obj['collection'] as unknown[];
    const sample = records[0];
    const fields = sample && typeof sample === 'object' ? Object.keys(sample as object) : [];
    const hasLegacyFields = fields.some((f) =>
      ['priceEUR', 'artLocalThumb', 'lang', 'sectionResolved', 'searchBlob'].includes(f),
    );
    return {
      isLegacy: true,
      format: hasLegacyFields ? 'ygo-vault-v10' : 'ygo-vault-generic',
      recordCount: records.length,
      sampleFields: fields.slice(0, 15),
    };
  }

  // Other legacy formats with 'cards' or 'entries' key
  if (obj['cards'] && Array.isArray(obj['cards'])) {
    return {
      isLegacy: true,
      format: 'ygo-vault-generic',
      recordCount: (obj['cards'] as unknown[]).length,
      sampleFields: [],
    };
  }

  if (obj['entries'] && Array.isArray(obj['entries'])) {
    return {
      isLegacy: true,
      format: 'ygo-vault-generic',
      recordCount: (obj['entries'] as unknown[]).length,
      sampleFields: [],
    };
  }

  return { isLegacy: false, format: 'unknown', recordCount: 0, sampleFields: [] };
}

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function sanitizeString(val: unknown): string | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  return String(val).trim() || undefined;
}

function sanitizeNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  return isFinite(num) ? num : null;
}

function sanitizePasscode(val: unknown): string | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  return String(val).trim() || undefined;
}

function sanitizeTags(val: unknown): string[] | undefined {
  if (!val) return undefined;
  if (Array.isArray(val)) {
    const filtered = val.filter((t) => typeof t === 'string' && t.trim().length > 0);
    return filtered.length > 0 ? filtered : undefined;
  }
  return undefined;
}

export interface LegacyImportReport {
  total: number;
  imported: number;
  warnings: LegacyImportWarning[];
}

export interface LegacyImportWarning {
  index: number;
  name: string;
  issues: string[];
}

export function mapLegacyRecord(record: LegacyRecord, index: number): {
  entry: CollectionEntry;
  warnings: string[];
} {
  const warnings: string[] = [];
  const now = nowISO();

  // Name: required
  let name = sanitizeString(record.name);
  if (!name) {
    name = sanitizeString(record.customTitle) || sanitizeString(record.enName) || `Unknown Card #${index + 1}`;
    warnings.push('Missing card name, used fallback');
  }

  // Qty
  let qty = typeof record.qty === 'number' ? Math.max(0, Math.round(record.qty)) : 1;
  if (qty === 0) {
    qty = 1;
    warnings.push('Qty was 0, set to 1');
  }

  // Price: prefer priceEUR, fall back to priceUSD, then marketPrice
  let marketPrice = sanitizeNumber(record.priceEUR);
  if (marketPrice === null) marketPrice = sanitizeNumber(record.priceUSD);
  if (marketPrice === null) marketPrice = sanitizeNumber(record.marketPrice);

  // Language
  const language = sanitizeString(record.lang) || sanitizeString(record.language);

  // Section -> tags
  const tags = sanitizeTags(record.tags) || [];
  const location = sanitizeString(record.location);
  const section = sanitizeString(record.section) || sanitizeString(record.sectionResolved);
  if (location && !tags.includes(location)) tags.push(location);
  if (section && !tags.includes(section)) tags.push(section);

  // Timestamps
  const createdAt = sanitizeString(record.createdAt) || now;
  const updatedAt = sanitizeString(record.updatedAt) || now;

  // Build notes from legacy fields
  const notesParts: string[] = [];
  if (record.notes) notesParts.push(String(record.notes));
  if (record.artLocalThumb) notesParts.push(`[legacy:artLocalThumb] ${record.artLocalThumb}`);
  if (record.artLocalFull) notesParts.push(`[legacy:artLocalFull] ${record.artLocalFull}`);
  if (record.itImageOverride) notesParts.push(`[legacy:itImageOverride] ${record.itImageOverride}`);
  const notes = notesParts.length > 0 ? notesParts.join('\n') : undefined;

  const entry: CollectionEntry = {
    entryId: createEntryId(),
    cardId: sanitizeString(record.id) || crypto.randomUUID(),
    name,
    localeName: sanitizeString(record.enName) || sanitizeString(record.customTitle),
    passcode: sanitizePasscode(record.passcode),
    qty,
    setCode: sanitizeString(record.setCode),
    setName: sanitizeString(record.setName),
    rarity: sanitizeString(record.rarity),
    mdRarity: sanitizeString(record.mdRarity),
    finishType: sanitizeString(record.finishType),
    archetype: sanitizeString(record.archetype),
    typeLine: sanitizeString(record.typeLine),
    frameType: sanitizeString(record.frameType),
    attribute: sanitizeString(record.attribute),
    levelRankLink: sanitizeNumber(record.levelRankLink) as number | null,
    atk: sanitizeNumber(record.atk) as number | null,
    def: sanitizeNumber(record.def) as number | null,
    language,
    condition: sanitizeString(record.condition),
    edition: sanitizeString(record.edition),
    imageMode: record.imageMode === 'custom' ? 'custom' : 'official',
    customImageId: sanitizeString(record.customImageId) || null,
    marketPrice,
    purchasePrice: null,
    targetPrice: null,
    priceSource: marketPrice !== null ? 'manual' : null,
    notes,
    tags: tags.length > 0 ? tags : undefined,
    artworkId: sanitizeString(record.artworkId),
    createdAt,
    updatedAt,
  };

  return { entry, warnings };
}

export function mapLegacyCollection(records: unknown[]): {
  entries: CollectionEntry[];
  report: LegacyImportReport;
} {
  const entries: CollectionEntry[] = [];
  const warnings: LegacyImportWarning[] = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i] as LegacyRecord;
    const result = mapLegacyRecord(record, i);
    entries.push(result.entry);
    if (result.warnings.length > 0) {
      warnings.push({
        index: i,
        name: result.entry.name,
        issues: result.warnings,
      });
    }
  }

  return {
    entries,
    report: {
      total: records.length,
      imported: entries.length,
      warnings,
    },
  };
}

export function extractLegacyRecords(data: unknown): unknown[] | null {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj['collection'])) return obj['collection'] as unknown[];
    if (Array.isArray(obj['cards'])) return obj['cards'] as unknown[];
    if (Array.isArray(obj['entries'])) return obj['entries'] as unknown[];
  }
  return null;
}
