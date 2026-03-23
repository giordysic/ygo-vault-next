import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollectionStore } from '@/features/collection/store';
import { filteredEntries } from '@/features/collection/selectors';
import { SearchInput } from '@/shared/components/ui/SearchInput';
import { Select } from '@/shared/components/ui/Select';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Button } from '@/shared/components/ui/Button';
import { CollectionGrid } from '@/features/collection/components/CollectionGrid';
import { CollectionList } from '@/features/collection/components/CollectionList';
import { CollectionFilters } from '@/features/collection/components/CollectionFilters';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import styles from './CollectionPage.module.css';

const SORT_OPTIONS = [
  { value: 'updatedAt:desc', label: 'Recently Updated' },
  { value: 'createdAt:desc', label: 'Recently Added' },
  { value: 'name:asc', label: 'Name A-Z' },
  { value: 'name:desc', label: 'Name Z-A' },
  { value: 'marketPrice:desc', label: 'Price High-Low' },
  { value: 'marketPrice:asc', label: 'Price Low-High' },
  { value: 'rarity:asc', label: 'Rarity' },
];

function CollectionPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showFilters, setShowFilters] = useState(false);

  const entries = useCollectionStore((s) => s.entries);
  const loading = useCollectionStore((s) => s.loading);
  const filters = useCollectionStore((s) => s.filters);
  const sort = useCollectionStore((s) => s.sort);
  const viewMode = useCollectionStore((s) => s.viewMode);
  const searchQuery = useCollectionStore((s) => s.searchQuery);
  const selectedIds = useCollectionStore((s) => s.selectedIds);
  const bulkMode = useCollectionStore((s) => s.bulkMode);
  const loadEntries = useCollectionStore((s) => s.loadEntries);
  const setSearchQuery = useCollectionStore((s) => s.setSearchQuery);
  const setSort = useCollectionStore((s) => s.setSort);
  const setViewMode = useCollectionStore((s) => s.setViewMode);
  const toggleBulkMode = useCollectionStore((s) => s.toggleBulkMode);
  const toggleSelected = useCollectionStore((s) => s.toggleSelected);
  const clearSelected = useCollectionStore((s) => s.clearSelected);
  const bulkRemove = useCollectionStore((s) => s.bulkRemove);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const displayed = useMemo(
    () => filteredEntries(entries, searchQuery, filters, sort),
    [entries, searchQuery, filters, sort],
  );

  const activeFilterCount = useMemo(
    () => Object.values(filters).reduce((sum, arr) => sum + arr.length, 0),
    [filters],
  );

  const sortValue = `${sort.field}:${sort.direction}`;

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const [field, direction] = e.target.value.split(':');
      setSort({ field, direction: direction as 'asc' | 'desc' });
    },
    [setSort],
  );

  const handleEntryClick = useCallback(
    (entryId: string) => {
      if (bulkMode) {
        toggleSelected(entryId);
      } else {
        navigate(`/collection/${entryId}`);
      }
    },
    [bulkMode, toggleSelected, navigate],
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const confirmed = window.confirm(
      `Delete ${selectedIds.size} selected entries? This cannot be undone.`,
    );
    if (confirmed) {
      await bulkRemove(Array.from(selectedIds));
    }
  }, [selectedIds, bulkRemove]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading collection...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search cards..."
          />
        </div>
        <div className={styles.topBarActions}>
          <div className={styles.filterToggle}>
            <IconButton
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              }
              label="Toggle filters"
              variant={showFilters ? 'tonal' : 'ghost'}
              onClick={() => setShowFilters((v) => !v)}
            />
            {activeFilterCount > 0 && (
              <span className={styles.filterBadge}>{activeFilterCount}</span>
            )}
          </div>
          <IconButton
            icon={
              viewMode === 'grid' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              )
            }
            label={viewMode === 'grid' ? 'Switch to list' : 'Switch to grid'}
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          />
          <Select
            options={SORT_OPTIONS}
            value={sortValue}
            onChange={handleSortChange}
            className={styles.sortSelect}
          />
          {!isMobile && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/collection/add')}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              Add Card
            </Button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && <CollectionFilters entries={entries} />}

      {/* Content */}
      <div className={styles.content}>
        {displayed.length === 0 ? (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <h3 className={styles.emptyTitle}>
              {entries.length === 0 ? 'No cards yet' : 'No matching cards'}
            </h3>
            <p className={styles.emptyDescription}>
              {entries.length === 0
                ? 'Start building your collection by adding your first card.'
                : 'Try adjusting your search or filters to find what you are looking for.'}
            </p>
            {entries.length === 0 && (
              <Button variant="primary" onClick={() => navigate('/collection/add')}>
                Add Your First Card
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <CollectionGrid
            entries={displayed}
            selectedIds={selectedIds}
            bulkMode={bulkMode}
            onEntryClick={handleEntryClick}
            onEntryLongPress={
              !bulkMode
                ? (entryId) => {
                    toggleBulkMode();
                    toggleSelected(entryId);
                  }
                : undefined
            }
          />
        ) : (
          <CollectionList
            entries={displayed}
            selectedIds={selectedIds}
            bulkMode={bulkMode}
            onEntryClick={handleEntryClick}
          />
        )}
      </div>

      {/* FAB on mobile */}
      {isMobile && !bulkMode && (
        <button
          className={styles.fab}
          onClick={() => navigate('/collection/add')}
          aria-label="Add card"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}

      {/* Bulk action bar */}
      {bulkMode && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkInfo}>
            {selectedIds.size} selected
          </span>
          <div className={styles.bulkActions}>
            <Button variant="ghost" size="sm" onClick={clearSelected}>
              Deselect All
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0}
            >
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleBulkMode}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollectionPage;
