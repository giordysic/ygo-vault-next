import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCollectionStore } from '@/features/collection/store';
import { useCardForm } from '@/features/card-editor/hooks/useCardForm';
import { CardForm } from '@/features/card-editor/components/CardForm';
import { CardPreview } from '@/features/card-editor/components/CardPreview';
import { Button } from '@/shared/components/ui/Button';
import { IconButton } from '@/shared/components/ui/IconButton';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import type { CollectionEntry } from '@/core/schemas/collection.schemas';
import { collectionRepository } from '@/core/storage/repositories/collectionRepository';
import styles from './CardEditorPage.module.css';

function CardEditorPage() {
  const navigate = useNavigate();
  const { entryId } = useParams<{ entryId: string }>();
  const isEditMode = Boolean(entryId);
  const isMobile = useIsMobile();

  const addEntry = useCollectionStore((s) => s.addEntry);
  const updateEntry = useCollectionStore((s) => s.updateEntry);

  const [existingEntry, setExistingEntry] = useState<CollectionEntry | undefined>(undefined);
  const [loadingEntry, setLoadingEntry] = useState(isEditMode);
  const [notFound, setNotFound] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing entry for edit mode
  useEffect(() => {
    if (!entryId) return;
    let cancelled = false;
    setLoadingEntry(true);
    collectionRepository.getById(entryId).then((entry) => {
      if (cancelled) return;
      if (entry) {
        setExistingEntry(entry);
      } else {
        setNotFound(true);
      }
      setLoadingEntry(false);
    });
    return () => {
      cancelled = true;
    };
  }, [entryId]);

  const form = useCardForm(existingEntry);

  const handleSave = useCallback(async () => {
    if (!form.validate()) return;
    setSaving(true);
    try {
      const data = form.getSubmitData();
      if (isEditMode && entryId) {
        await updateEntry(entryId, data);
      } else {
        await addEntry(data);
      }
      navigate(-1);
    } catch {
      // Error handling would go here
    } finally {
      setSaving(false);
    }
  }, [form, isEditMode, entryId, addEntry, updateEntry, navigate]);

  const handleCancel = useCallback(() => {
    if (form.isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?',
      );
      if (!confirmed) return;
    }
    navigate(-1);
  }, [form.isDirty, navigate]);

  if (loadingEntry) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading card...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h2 className={styles.notFoundTitle}>Card not found</h2>
          <p>The card you are trying to edit does not exist.</p>
          <Button variant="primary" onClick={() => navigate('/collection')}>
            Back to Collection
          </Button>
        </div>
      </div>
    );
  }

  const previewAreaClasses = [
    styles.previewArea,
    isMobile && showPreview ? styles.previewAreaVisible : '',
  ]
    .filter(Boolean)
    .join(' ');

  const formAreaClasses = [
    styles.formArea,
    isMobile && showPreview ? styles.hidden : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backButton}
            onClick={handleCancel}
            aria-label="Go back"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className={styles.title}>
            {isEditMode ? 'Edit Card' : 'Add Card'}
          </h1>
        </div>
        <div className={styles.headerActions}>
          {isMobile && (
            <IconButton
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              }
              label={showPreview ? 'Show form' : 'Show preview'}
              variant={showPreview ? 'tonal' : 'ghost'}
              onClick={() => setShowPreview((v) => !v)}
              className={styles.previewToggle}
            />
          )}
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            loading={saving}
            disabled={!form.isValid}
          >
            {isEditMode ? 'Save Changes' : 'Add Card'}
          </Button>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={formAreaClasses}>
          <CardForm form={form} />
        </div>
        <div className={previewAreaClasses}>
          <CardPreview values={form.values} />
        </div>
      </div>
    </div>
  );
}

export default CardEditorPage;
