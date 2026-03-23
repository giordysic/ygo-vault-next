import { db } from '@/core/storage/db';
import type { CollectionEntry } from '@/core/schemas/collection.schemas';

export const collectionRepository = {
  async getAll(): Promise<CollectionEntry[]> {
    return db.collectionEntries.toArray();
  },

  async getById(entryId: string): Promise<CollectionEntry | undefined> {
    return db.collectionEntries.get(entryId);
  },

  async getByIds(entryIds: string[]): Promise<CollectionEntry[]> {
    const results = await db.collectionEntries.bulkGet(entryIds);
    return results.filter((r): r is CollectionEntry => r !== undefined);
  },

  async add(entry: CollectionEntry): Promise<void> {
    await db.collectionEntries.add(entry);
  },

  async update(entryId: string, changes: Partial<CollectionEntry>): Promise<void> {
    await db.collectionEntries.update(entryId, changes);
  },

  async remove(entryId: string): Promise<void> {
    await db.collectionEntries.delete(entryId);
  },

  async bulkAdd(entries: CollectionEntry[]): Promise<void> {
    await db.collectionEntries.bulkAdd(entries);
  },

  async bulkRemove(entryIds: string[]): Promise<void> {
    await db.collectionEntries.bulkDelete(entryIds);
  },

  async count(): Promise<number> {
    return db.collectionEntries.count();
  },

  async clear(): Promise<void> {
    await db.collectionEntries.clear();
  },
};
