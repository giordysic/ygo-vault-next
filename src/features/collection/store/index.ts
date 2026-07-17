import { create } from 'zustand';
import type { CollectionEntry } from '@/core/schemas/collection.schemas';
import { collectionRepository } from '@/core/storage/repositories/collectionRepository';
import { createEntryId } from '@/core/types/ids';
import { nowISO } from '@/core/utils/dates';
import type { ViewMode, SortSpec } from '@/core/types/common';

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

export interface CollectionFilters {
  rarity: string[];
  archetype: string[];
  setCode: string[];
  typeLine: string[];
  tags: string[];
  language: string[];
  condition: string[];
  mdRarity: string[];
}

const emptyFilters: CollectionFilters = {
  rarity: [],
  archetype: [],
  setCode: [],
  typeLine: [],
  tags: [],
  language: [],
  condition: [],
  mdRarity: [],
};

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface CollectionState {
  entries: CollectionEntry[];
  loading: boolean;
  filters: CollectionFilters;
  sort: SortSpec;
  viewMode: ViewMode;
  searchQuery: string;
  selectedIds: Set<string>;
  bulkMode: boolean;
}

interface CollectionActions {
  loadEntries: () => Promise<void>;
  addEntry: (data: Omit<CollectionEntry, 'entryId' | 'createdAt' | 'updatedAt'>) => Promise<CollectionEntry>;
  updateEntry: (entryId: string, changes: Partial<CollectionEntry>) => Promise<void>;
  removeEntry: (entryId: string) => Promise<void>;
  bulkRemove: (entryIds: string[]) => Promise<void>;
  duplicateEntry: (entryId: string) => Promise<CollectionEntry | null>;
  changeQty: (entryId: string, delta: number) => Promise<void>;
  bulkSetTags: (entryIds: string[], tags: string[]) => Promise<void>;
  setFilter: <K extends keyof CollectionFilters>(key: K, value: CollectionFilters[K]) => void;
  clearFilters: () => void;
  setSort: (sort: SortSpec) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  toggleBulkMode: () => void;
  toggleSelected: (entryId: string) => void;
  clearSelected: () => void;
}

type CollectionStore = CollectionState & CollectionActions;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCollectionStore = create<CollectionStore>()((set, get) => ({
  entries: [],
  loading: false,
  filters: { ...emptyFilters },
  sort: { field: 'updatedAt', direction: 'desc' },
  viewMode: 'grid',
  searchQuery: '',
  selectedIds: new Set<string>(),
  bulkMode: false,

  async loadEntries() {
    set({ loading: true });
    try {
      const entries = await collectionRepository.getAll();
      set({ entries, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  async addEntry(data) {
    const now = nowISO();
    const entry: CollectionEntry = {
      ...data,
      entryId: createEntryId(),
      createdAt: now,
      updatedAt: now,
    };
    await collectionRepository.add(entry);
    set((s) => ({ entries: [entry, ...s.entries] }));
    return entry;
  },

  async updateEntry(entryId, changes) {
    const updatedChanges = { ...changes, updatedAt: nowISO() };
    await collectionRepository.update(entryId, updatedChanges);
    set((s) => ({
      entries: s.entries.map((e) =>
        e.entryId === entryId ? { ...e, ...updatedChanges } : e,
      ),
    }));
  },

  async removeEntry(entryId) {
    await collectionRepository.remove(entryId);
    set((s) => ({
      entries: s.entries.filter((e) => e.entryId !== entryId),
      selectedIds: (() => {
        const next = new Set(s.selectedIds);
        next.delete(entryId);
        return next;
      })(),
    }));
  },

  async bulkRemove(entryIds) {
    await collectionRepository.bulkRemove(entryIds);
    const toRemove = new Set(entryIds);
    set((s) => ({
      entries: s.entries.filter((e) => !toRemove.has(e.entryId)),
      selectedIds: new Set<string>(),
      bulkMode: false,
    }));
  },

  async duplicateEntry(entryId) {
    const source = get().entries.find((e) => e.entryId === entryId);
    if (!source) return null;
    const now = nowISO();
    const clone: CollectionEntry = {
      ...source,
      entryId: createEntryId(),
      createdAt: now,
      updatedAt: now,
    };
    await collectionRepository.add(clone);
    set((s) => ({ entries: [clone, ...s.entries] }));
    return clone;
  },

  async changeQty(entryId, delta) {
    const entry = get().entries.find((e) => e.entryId === entryId);
    if (!entry) return;
    const newQty = Math.max(0, entry.qty + delta);
    await collectionRepository.update(entryId, { qty: newQty, updatedAt: nowISO() });
    set((s) => ({
      entries: s.entries.map((e) =>
        e.entryId === entryId ? { ...e, qty: newQty, updatedAt: nowISO() } : e,
      ),
    }));
  },

  async bulkSetTags(entryIds, tags) {
    const now = nowISO();
    for (const id of entryIds) {
      await collectionRepository.update(id, { tags, updatedAt: now });
    }
    const idSet = new Set(entryIds);
    set((s) => ({
      entries: s.entries.map((e) =>
        idSet.has(e.entryId) ? { ...e, tags, updatedAt: now } : e,
      ),
      selectedIds: new Set<string>(),
      bulkMode: false,
    }));
  },

  setFilter(key, value) {
    set((s) => ({ filters: { ...s.filters, [key]: value } }));
  },

  clearFilters() {
    set({ filters: { ...emptyFilters } });
  },

  setSort(sort) {
    set({ sort });
  },

  setViewMode(mode) {
    set({ viewMode: mode });
  },

  setSearchQuery(query) {
    set({ searchQuery: query });
  },

  toggleBulkMode() {
    set((s) => ({
      bulkMode: !s.bulkMode,
      selectedIds: s.bulkMode ? new Set<string>() : s.selectedIds,
    }));
  },

  toggleSelected(entryId) {
    set((s) => {
      const next = new Set(s.selectedIds);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return { selectedIds: next };
    });
  },

  clearSelected() {
    set({ selectedIds: new Set<string>() });
  },
}));
