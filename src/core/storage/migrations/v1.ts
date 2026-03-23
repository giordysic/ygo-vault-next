/**
 * Schema definition for database version 1.
 *
 * Each value is a Dexie index specification string:
 *   - `&` = unique index
 *   - `++` = auto-increment primary key
 *   - `*` = multi-valued index (array)
 *   - plain = indexed field
 *
 * Fields that are not listed here are still stored, just not indexed.
 */

export const V1_SCHEMA: Record<string, string> = {
  collectionEntries:
    '&entryId, cardId, name, setCode, rarity, archetype, frameType, attribute, *tags, createdAt, updatedAt',

  decks:
    '&deckId, name, format, isFavorite, createdAt, updatedAt',

  settings:
    '&id',

  mediaAssets:
    '&mediaId, entryId, type, createdAt',

  priceHistory:
    '&id, cardId, source, fetchedAt',

  backups:
    '&id, createdAt',

  savedFilters:
    '&id, name, createdAt',

  appMeta:
    '&key',
};
