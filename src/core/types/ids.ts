/** Branded type for entry IDs. */
export type EntryId = string & { readonly __brand: 'EntryId' };

/** Branded type for deck IDs. */
export type DeckId = string & { readonly __brand: 'DeckId' };

/** Branded type for media asset IDs. */
export type MediaId = string & { readonly __brand: 'MediaId' };

/** Generate a new unique entry ID. */
export function createEntryId(): EntryId {
  return crypto.randomUUID() as EntryId;
}

/** Generate a new unique deck ID. */
export function createDeckId(): DeckId {
  return crypto.randomUUID() as DeckId;
}

/** Generate a new unique media asset ID. */
export function createMediaId(): MediaId {
  return crypto.randomUUID() as MediaId;
}

/** Generate a generic unique ID. */
export function createId(): string {
  return crypto.randomUUID();
}
