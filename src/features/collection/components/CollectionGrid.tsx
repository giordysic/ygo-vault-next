import { useRef, useCallback } from 'react';
import type { CollectionEntry } from '@/core/schemas/collection.schemas';
import { formatPrice, formatQty } from '@/core/utils/formatters';
import styles from './CollectionGrid.module.css';

export interface CollectionGridProps {
  entries: CollectionEntry[];
  selectedIds: Set<string>;
  bulkMode: boolean;
  onEntryClick: (entryId: string) => void;
  onEntryLongPress?: (entryId: string) => void;
}

export function CollectionGrid({
  entries,
  selectedIds,
  bulkMode,
  onEntryClick,
  onEntryLongPress,
}: CollectionGridProps) {
  return (
    <div className={styles.grid}>
      {entries.map((entry) => (
        <GridTile
          key={entry.entryId}
          entry={entry}
          selected={selectedIds.has(entry.entryId)}
          bulkMode={bulkMode}
          onClick={() => onEntryClick(entry.entryId)}
          onLongPress={onEntryLongPress ? () => onEntryLongPress(entry.entryId) : undefined}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid Tile
// ---------------------------------------------------------------------------

interface GridTileProps {
  entry: CollectionEntry;
  selected: boolean;
  bulkMode: boolean;
  onClick: () => void;
  onLongPress?: () => void;
}

function GridTile({ entry, selected, bulkMode, onClick, onLongPress }: GridTileProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const handlePointerDown = useCallback(() => {
    if (!onLongPress) return;
    longPressTriggered.current = false;
    timerRef.current = setTimeout(() => {
      longPressTriggered.current = true;
      onLongPress();
    }, 500);
  }, [onLongPress]);

  const handlePointerUp = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!longPressTriggered.current) {
      onClick();
    }
    longPressTriggered.current = false;
  }, [onClick]);

  const handlePointerCancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    longPressTriggered.current = false;
  }, []);

  const tileClasses = [styles.tile, selected ? styles.tileSelected : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={tileClasses}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(e) => {
        if (onLongPress) e.preventDefault();
      }}
      role="button"
      tabIndex={0}
      aria-selected={selected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {bulkMode && (
        <span
          className={[
            styles.selectOverlay,
            selected ? styles.selectOverlayChecked : '',
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

      <div className={styles.imageArea}>
        <span className={styles.cardName}>{entry.name}</span>
      </div>

      <div className={styles.infoArea}>
        <div className={styles.tileName} title={entry.name}>
          {entry.name}
        </div>
        {(entry.setCode || entry.setName) && (
          <div className={styles.tileSet}>
            {entry.setCode}{entry.setCode && entry.setName ? ' - ' : ''}{entry.setName}
          </div>
        )}
        <div className={styles.tileMeta}>
          {entry.rarity && (
            <span className={styles.rarityBadge}>{entry.rarity}</span>
          )}
          <span className={styles.qtyBadge}>{formatQty(entry.qty)}</span>
          {entry.marketPrice != null && (
            <span className={styles.tilePrice}>
              {formatPrice(entry.marketPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
