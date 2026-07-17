import { useMemo } from 'react';
import type { CollectionEntry } from '@/core/schemas/collection.schemas';
import { useCollectionStore, type CollectionFilters as FiltersType } from '@/features/collection/store';
import { Select } from '@/shared/components/ui/Select';
import { Chip } from '@/shared/components/ui/Chip';
import styles from './CollectionFilters.module.css';

interface CollectionFiltersProps {
  entries: CollectionEntry[];
}

/** Extract unique sorted values for a field from entries. */
function uniqueValues(entries: CollectionEntry[], field: keyof CollectionEntry): string[] {
  const vals = new Set<string>();
  for (const e of entries) {
    const v = e[field];
    if (typeof v === 'string' && v.length > 0) vals.add(v);
  }
  return Array.from(vals).sort();
}

/** Extract unique tags across all entries. */
function uniqueTags(entries: CollectionEntry[]): string[] {
  const vals = new Set<string>();
  for (const e of entries) {
    if (e.tags) {
      for (const t of e.tags) vals.add(t);
    }
  }
  return Array.from(vals).sort();
}

export function CollectionFilters({ entries }: CollectionFiltersProps) {
  const filters = useCollectionStore((s) => s.filters);
  const setFilter = useCollectionStore((s) => s.setFilter);
  const clearFilters = useCollectionStore((s) => s.clearFilters);

  const rarityOptions = useMemo(
    () => [{ value: '', label: 'All Rarities' }, ...uniqueValues(entries, 'rarity').map((v) => ({ value: v, label: v }))],
    [entries],
  );
  const archetypeOptions = useMemo(
    () => [{ value: '', label: 'All Archetypes' }, ...uniqueValues(entries, 'archetype').map((v) => ({ value: v, label: v }))],
    [entries],
  );
  const setCodeOptions = useMemo(
    () => [{ value: '', label: 'All Sets' }, ...uniqueValues(entries, 'setCode').map((v) => ({ value: v, label: v }))],
    [entries],
  );
  const typeLineOptions = useMemo(
    () => [{ value: '', label: 'All Types' }, ...uniqueValues(entries, 'typeLine').map((v) => ({ value: v, label: v }))],
    [entries],
  );
  const tagOptions = useMemo(
    () => [{ value: '', label: 'All Tags' }, ...uniqueTags(entries).map((v) => ({ value: v, label: v }))],
    [entries],
  );
  const languageOptions = useMemo(
    () => [{ value: '', label: 'All Languages' }, ...uniqueValues(entries, 'language').map((v) => ({ value: v, label: v }))],
    [entries],
  );
  const conditionOptions = useMemo(
    () => [{ value: '', label: 'All Conditions' }, ...uniqueValues(entries, 'condition').map((v) => ({ value: v, label: v }))],
    [entries],
  );
  const mdRarityOptions = useMemo(
    () => [{ value: '', label: 'All MD Rarities' }, ...uniqueValues(entries, 'mdRarity').map((v) => ({ value: v, label: v }))],
    [entries],
  );

  const activeFilterCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

  const handleSelect = (key: keyof FiltersType, value: string) => {
    if (!value) {
      setFilter(key, []);
    } else {
      const current = filters[key];
      if (!current.includes(value)) {
        setFilter(key, [...current, value]);
      }
    }
  };

  const handleRemove = (key: keyof FiltersType, value: string) => {
    setFilter(key, filters[key].filter((v) => v !== value));
  };

  // Collect all active filter chips
  const activeChips: { key: keyof FiltersType; value: string; label: string }[] = [];
  for (const [key, values] of Object.entries(filters) as [keyof FiltersType, string[]][]) {
    for (const v of values) {
      activeChips.push({ key, value: v, label: `${key}: ${v}` });
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </span>
        {activeFilterCount > 0 && (
          <button type="button" className={styles.clearButton} onClick={clearFilters}>
            Clear all
          </button>
        )}
      </div>

      <div className={styles.fields}>
        <Select
          label="Rarity"
          options={rarityOptions}
          value=""
          onChange={(e) => handleSelect('rarity', e.target.value)}
        />
        <Select
          label="Archetype"
          options={archetypeOptions}
          value=""
          onChange={(e) => handleSelect('archetype', e.target.value)}
        />
        <Select
          label="Set"
          options={setCodeOptions}
          value=""
          onChange={(e) => handleSelect('setCode', e.target.value)}
        />
        <Select
          label="Type"
          options={typeLineOptions}
          value=""
          onChange={(e) => handleSelect('typeLine', e.target.value)}
        />
        <Select
          label="Tags"
          options={tagOptions}
          value=""
          onChange={(e) => handleSelect('tags', e.target.value)}
        />
        <Select
          label="Language"
          options={languageOptions}
          value=""
          onChange={(e) => handleSelect('language', e.target.value)}
        />
        <Select
          label="Condition"
          options={conditionOptions}
          value=""
          onChange={(e) => handleSelect('condition', e.target.value)}
        />
        <Select
          label="MD Rarity"
          options={mdRarityOptions}
          value=""
          onChange={(e) => handleSelect('mdRarity', e.target.value)}
        />
      </div>

      {activeChips.length > 0 && (
        <div className={styles.activeChips}>
          {activeChips.map((chip) => (
            <Chip
              key={`${chip.key}-${chip.value}`}
              label={chip.label}
              onRemove={() => handleRemove(chip.key, chip.value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
