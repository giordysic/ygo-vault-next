import type { ImportPayload } from '@/core/schemas/import.schemas';
import type { ImportStrategy } from '@/core/types/common';
import { Button } from '@/shared/components/ui/Button';
import { formatDate } from '@/core/utils/formatters';
import styles from './ImportPreview.module.css';

interface ImportPreviewProps {
  payload: ImportPayload;
  importing: boolean;
  onConfirm: (strategy: ImportStrategy) => void;
  onCancel: () => void;
}

export function ImportPreview({
  payload,
  importing,
  onConfirm,
  onCancel,
}: ImportPreviewProps) {
  const { metadata, collectionEntries, decks, settings } = payload;

  return (
    <div className={styles.preview}>
      <h3 className={styles.title}>Import Preview</h3>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Entries</span>
          <span className={styles.statValue}>
            {collectionEntries?.length ?? 0}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Decks</span>
          <span className={styles.statValue}>
            {decks?.length ?? 0}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Settings</span>
          <span className={styles.statValue}>
            {settings ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      <div className={styles.metadata}>
        <div>App Version: {metadata.appVersion}</div>
        <div>Schema Version: {metadata.schemaVersion}</div>
        <div>Exported: {formatDate(metadata.exportedAt)}</div>
      </div>

      <div className={styles.actions}>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onConfirm('merge')}
          loading={importing}
        >
          Merge (keep existing)
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onConfirm('replace')}
          loading={importing}
        >
          Replace (overwrite)
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={importing}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
