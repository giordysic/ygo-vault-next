import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { CollectionEntry } from '@/core/schemas/collection.schemas';
import { collectionRepository } from '@/core/storage/repositories/collectionRepository';
import { useCollectionStore } from '@/features/collection/store';
import { CardInfoSection } from '@/features/card-detail/components/CardInfoSection';
import { CardPricingBlock } from '@/features/card-detail/components/CardPricingBlock';
import { Button } from '@/shared/components/ui/Button';
import { Chip } from '@/shared/components/ui/Chip';
import { formatQty, formatDate } from '@/core/utils/formatters';
import { buildRoute, ROUTES } from '@/core/constants/routes';
import styles from './CardDetailPage.module.css';

function CardDetailPage() {
  const navigate = useNavigate();
  const { entryId } = useParams<{ entryId: string }>();

  const removeEntry = useCollectionStore((s) => s.removeEntry);
  const duplicateEntry = useCollectionStore((s) => s.duplicateEntry);
  const changeQty = useCollectionStore((s) => s.changeQty);

  const [entry, setEntry] = useState<CollectionEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!entryId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    collectionRepository.getById(entryId).then((result) => {
      if (cancelled) return;
      if (result) {
        setEntry(result);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [entryId]);

  const handleEdit = useCallback(() => {
    if (!entryId) return;
    navigate(buildRoute(ROUTES.COLLECTION_ENTRY_EDIT, { entryId }));
  }, [entryId, navigate]);

  const handleDelete = useCallback(async () => {
    if (!entryId) return;
    const confirmed = window.confirm(
      'Are you sure you want to delete this card? This cannot be undone.',
    );
    if (!confirmed) return;
    await removeEntry(entryId);
    navigate('/collection');
  }, [entryId, removeEntry, navigate]);

  const handleDuplicate = useCallback(async () => {
    if (!entryId) return;
    const clone = await duplicateEntry(entryId);
    if (clone) {
      navigate(`/collection/${clone.entryId}`);
    }
  }, [entryId, duplicateEntry, navigate]);

  const handleQtyChange = useCallback(async (delta: number) => {
    if (!entryId || !entry) return;
    await changeQty(entryId, delta);
    setEntry((prev) => prev ? { ...prev, qty: Math.max(0, prev.qty + delta) } : prev);
  }, [entryId, entry, changeQty]);

  const handleClone = useCallback(() => {
    if (!entryId) return;
    navigate(`/collection/add?cloneFrom=${entryId}`);
  }, [entryId, navigate]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading card details...</div>
      </div>
    );
  }

  if (notFound || !entry) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h2 className={styles.notFoundTitle}>Card not found</h2>
          <p className={styles.notFoundDesc}>
            This card may have been deleted or the link is invalid.
          </p>
          <Button variant="primary" onClick={() => navigate('/collection')}>
            Back to Collection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate('/collection')}
            aria-label="Back to collection"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className={styles.cardTitle} title={entry.name}>
            {entry.name}
          </h1>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" size="sm" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDuplicate}>
            Duplicate
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClone}>
            Clone
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      {/* Qty controls */}
      <div className={styles.qtySection}>
        <button
          type="button"
          className={styles.qtyButton}
          onClick={() => handleQtyChange(-1)}
          disabled={entry.qty <= 0}
        >
          -
        </button>
        <span className={styles.qtyDisplay}>{formatQty(entry.qty)}</span>
        <button
          type="button"
          className={styles.qtyButton}
          onClick={() => handleQtyChange(1)}
        >
          +
        </button>
      </div>

      {/* Image */}
      <div className={styles.imageSection}>
        <div className={styles.imageArea}>
          <span className={styles.imagePlaceholder}>{entry.name}</span>
        </div>
      </div>

      {/* Info sections */}
      <div className={styles.infoGrid}>
        <CardInfoSection
          title="Basic Info"
          pairs={[
            { label: 'Name', value: entry.name },
            { label: 'Quantity', value: formatQty(entry.qty) },
            { label: 'Archetype', value: entry.archetype },
            { label: 'Type', value: entry.typeLine },
            { label: 'Frame', value: entry.frameType },
            { label: 'Attribute', value: entry.attribute },
            { label: 'Level / Rank / Link', value: entry.levelRankLink },
            { label: 'ATK', value: entry.atk },
            { label: 'DEF', value: entry.def },
            { label: 'Passcode', value: entry.passcode },
          ]}
        />

        <CardInfoSection
          title="Set & Rarity"
          pairs={[
            { label: 'Set Code', value: entry.setCode },
            { label: 'Set Name', value: entry.setName },
            { label: 'Rarity', value: entry.rarity },
            { label: 'Condition', value: entry.condition },
            { label: 'Edition', value: entry.edition },
            { label: 'Language', value: entry.language },
            { label: 'Finish', value: entry.finishType },
          ]}
        />

        <CardPricingBlock
          marketPrice={entry.marketPrice}
          purchasePrice={entry.purchasePrice}
          targetPrice={entry.targetPrice}
        />

        <CardInfoSection
          title="Metadata"
          pairs={[
            { label: 'Created', value: formatDate(entry.createdAt) },
            { label: 'Updated', value: formatDate(entry.updatedAt) },
          ]}
        />

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className={styles.tagsSection}>
            <h3 className={styles.tagsSectionTitle}>Tags</h3>
            <div className={styles.tagsList}>
              {entry.tags.map((tag) => (
                <Chip key={tag} label={tag} />
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <div className={styles.notesSection}>
            <h3 className={styles.notesSectionTitle}>Notes</h3>
            <p className={styles.notesText}>{entry.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardDetailPage;
