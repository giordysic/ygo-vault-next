import { db } from '../db';
import type { Deck } from '../../schemas/deck.schemas';
import { createError } from '../../utils/errors';

/**
 * Repository for Deck CRUD operations.
 */
export const deckRepository = {
  /** Get all decks. */
  async getAll(): Promise<Deck[]> {
    return db.decks.toArray();
  },

  /** Get a single deck by ID. */
  async getById(deckId: string): Promise<Deck | undefined> {
    return db.decks.get(deckId);
  },

  /** Add a new deck. */
  async add(deck: Deck): Promise<string> {
    try {
      return await db.decks.add(deck);
    } catch (err) {
      throw createError('STORAGE', `Failed to add deck: ${(err as Error).message}`, err);
    }
  },

  /** Update an existing deck by merging partial fields. */
  async update(deckId: string, changes: Partial<Deck>): Promise<void> {
    const count = await db.decks.update(deckId, changes);
    if (count === 0) {
      throw createError('NOT_FOUND', `Deck not found: ${deckId}`);
    }
  },

  /** Remove a deck by ID. */
  async remove(deckId: string): Promise<void> {
    await db.decks.delete(deckId);
  },

  /** Bulk add decks. */
  async bulkAdd(decks: Deck[]): Promise<number> {
    try {
      const keys = await db.decks.bulkAdd(decks, { allKeys: true });
      return Array.isArray(keys) ? keys.length : decks.length;
    } catch (err) {
      throw createError('STORAGE', `Bulk add decks failed: ${(err as Error).message}`, err);
    }
  },

  /** Bulk remove decks by IDs. */
  async bulkRemove(deckIds: string[]): Promise<void> {
    await db.decks.bulkDelete(deckIds);
  },

  /** Get all favorite decks. */
  async getFavorites(): Promise<Deck[]> {
    return db.decks.where('isFavorite').equals(1).toArray();
  },

  /** Count total decks. */
  async count(): Promise<number> {
    return db.decks.count();
  },

  /** Clear all decks. */
  async clear(): Promise<void> {
    await db.decks.clear();
  },
};
