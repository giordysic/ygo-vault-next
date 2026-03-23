import type { CollectionEntry } from '@/core/schemas/collection.schemas';
import { formatPrice, formatQty, truncateText } from '@/core/utils/formatters';
import styles from './CollectionList.module.css';

export interface CollectionListProps {
  entries: CollectionEntry[];
  selectedIds: Set<string>;
  bulkMode: boolean;
  onEntryClick: (entryId: string) => void;
}

export function CollectionList({
  entries,
  selectedIds,
  bulkMode,
  onEntryClick,
}: CollectionListProps) {
  return (
    <div className={styles.list} role="list">
      {entries.map((entry) => {
        const selected = selectedIds.has(entry.entryId);
        const rowClasses = [styles.row, selected ? styles.rowSelected : '']
          .filter(Boolean)
          .join(' ');

        return (
          <div
            key={entry.entryId}
            className={rowClasses}
            onClick={() => onEntryClick(entry.entryId)}
            role="listitem"
            tabIndex={0}
            aria-selected={bulkMode ? selected : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onEntryClick(entry.entryId);
              }
            }}
          >
            {bulkMode && (
              <span
                className={[
                  styles.selectIndicator,
                  selected ? styles.selectIndicatorChecked : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              >
                {selected && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </span>
            )}

            <div className={styles.thumb}>
              <span className={styles.thumbLabel}>
                {truncateText(entry.name, 16)}
              </span>
            </div>

            <div className={styles.rowInfo}>
              <div className={styles.rowName} title={entry.name}>
                {entry.name}
              </div>
              {(entry.setCode || entry.setName) && (
                <div className={styles.rowSet}>
                  {entry.setCode}{entry.setCode && entry.setName ? ' - ' : ''}{entry.setName}
                </div>
              )}
            </div>

            <div className={styles.rowMeta}>
              {entry.rarity && (
                <span className={styles.rowRarity}>{entry.rarity}</span>
              )}
              <span className={styles.rowQty}>{formatQty(entry.qty)}</span>
              <span className={styles.rowPrice}>
                {formatPrice(entry.marketPrice)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
