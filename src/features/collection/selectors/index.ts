import Fuse from 'fuse.js';
import type { CollectionEntry } from '@/core/schemas/collection.schemas';
import type { SortSpec } from '@/core/types/common';
import type { CollectionFilters } from '@/features/collection/store';
import { APP_CONFIG } from '@/core/config/appConfig';

// ---------------------------------------------------------------------------
// Fuse.js instance cache
// ---------------------------------------------------------------------------

let cachedFuse: Fuse<CollectionEntry> | null = null;
let cachedEntries: CollectionEntry[] | null = null;

function getFuse(entries: CollectionEntry[]): Fuse<CollectionEntry> {
  if (cachedFuse && cachedEntries === entries) return cachedFuse;
  cachedFuse = new Fuse(entries, {
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
    ],
    threshold: APP_CONFIG.search.fuseThreshold,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: APP_CONFIG.search.minQueryLength,
  });
  cachedEntries = entries;
  return cachedFuse;
}

// ---------------------------------------------------------------------------
// Filtering helpers
// ---------------------------------------------------------------------------

function matchesFilters(entry: CollectionEntry, filters: CollectionFilters): boolean {
  if (filters.rarity.length > 0 && (!entry.rarity || !filters.rarity.includes(entry.rarity))) {
    return false;
  }
  if (filters.archetype.length > 0 && (!entry.archetype || !filters.archetype.includes(entry.archetype))) {
    return false;
  }
  if (filters.setCode.length > 0 && (!entry.setCode || !filters.setCode.includes(entry.setCode))) {
    return false;
  }
  if (filters.typeLine.length > 0 && (!entry.typeLine || !filters.typeLine.includes(entry.typeLine))) {
    return false;
  }
  if (filters.tags.length > 0) {
    const entryTags = entry.tags ?? [];
    if (!filters.tags.some((t) => entryTags.includes(t))) {
      return false;
    }
  }
  if (filters.language.length > 0 && (!entry.language || !filters.language.includes(entry.language))) {
    return false;
  }
  if (filters.condition.length > 0 && (!entry.condition || !filters.condition.includes(entry.condition))) {
    return false;
  }
  if (filters.mdRarity.length > 0 && (!entry.mdRarity || !filters.mdRarity.includes(entry.mdRarity))) {
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Sorting helpers
// ---------------------------------------------------------------------------

function compareEntries(a: CollectionEntry, b: CollectionEntry, sort: SortSpec): number {
  const field = sort.field as keyof CollectionEntry;
  const av = a[field];
  const bv = b[field];

  let cmp = 0;
  if (av == null && bv == null) cmp = 0;
  else if (av == null) cmp = 1;
  else if (bv == null) cmp = -1;
  else if (typeof av === 'string' && typeof bv === 'string') {
    cmp = av.localeCompare(bv);
  } else if (typeof av === 'number' && typeof bv === 'number') {
    cmp = av - bv;
  } else {
    cmp = String(av).localeCompare(String(bv));
  }

  return sort.direction === 'desc' ? -cmp : cmp;
}

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export function filteredEntries(
  entries: CollectionEntry[],
  searchQuery: string,
  filters: CollectionFilters,
  sort: SortSpec,
): CollectionEntry[] {
  let result = entries;

  // Apply search
  const trimmed = searchQuery.trim();
  if (trimmed.length >= APP_CONFIG.search.minQueryLength) {
    const fuse = getFuse(entries);
    result = fuse
      .search(trimmed, { limit: APP_CONFIG.search.maxResults })
      .map((r) => r.item);
  }

  // Apply filters
  const hasActiveFilters = Object.values(filters).some((arr) => arr.length > 0);
  if (hasActiveFilters) {
    result = result.filter((entry) => matchesFilters(entry, filters));
  }

  // Apply sort
  result = [...result].sort((a, b) => compareEntries(a, b, sort));

  return result;
}

// ---------------------------------------------------------------------------
// Stats selector
// ---------------------------------------------------------------------------

export interface CollectionStats {
  totalCards: number;
  totalValue: number;
  uniqueCards: number;
  totalEntries: number;
  avgPrice: number;
  rarityBreakdown: Record<string, number>;
}

export function collectionStats(entries: CollectionEntry[]): CollectionStats {
  const uniqueCardIds = new Set<string>();
  let totalCards = 0;
  let totalValue = 0;
  let pricedCount = 0;
  const rarityBreakdown: Record<string, number> = {};

  for (const entry of entries) {
    uniqueCardIds.add(entry.cardId);
    totalCards += entry.qty;

    if (entry.marketPrice != null) {
      totalValue += entry.marketPrice * entry.qty;
      pricedCount++;
    }

    if (entry.rarity) {
      rarityBreakdown[entry.rarity] = (rarityBreakdown[entry.rarity] ?? 0) + entry.qty;
    }
  }

  return {
    totalCards,
    totalValue,
    uniqueCards: uniqueCardIds.size,
    totalEntries: entries.length,
    avgPrice: pricedCount > 0 ? totalValue / pricedCount : 0,
    rarityBreakdown,
  };
}
