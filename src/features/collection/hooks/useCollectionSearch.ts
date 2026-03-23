import { useRef, useCallback, useEffect } from 'react';
import Fuse from 'fuse.js';
import type { CollectionEntry } from '@/core/schemas/collection.schemas';
import { APP_CONFIG } from '@/core/config/appConfig';

type FuseOptions = ConstructorParameters<typeof Fuse<CollectionEntry>>[1];

const FUSE_OPTIONS: FuseOptions = {
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
};

export interface UseCollectionSearchReturn {
  search: (query: string) => CollectionEntry[];
}

/**
 * Hook that creates and manages a Fuse.js instance for collection search.
 * Re-indexes automatically when entries change.
 */
export function useCollectionSearch(entries: CollectionEntry[]): UseCollectionSearchReturn {
  const fuseRef = useRef<Fuse<CollectionEntry>>(new Fuse(entries, FUSE_OPTIONS));

  useEffect(() => {
    fuseRef.current = new Fuse(entries, FUSE_OPTIONS);
  }, [entries]);

  const search = useCallback(
    (query: string): CollectionEntry[] => {
      const trimmed = query.trim();
      if (trimmed.length < APP_CONFIG.search.minQueryLength) {
        return [];
      }
      return fuseRef.current
        .search(trimmed, { limit: APP_CONFIG.search.maxResults })
        .map((r) => r.item);
    },
    [],
  );

  return { search };
}
