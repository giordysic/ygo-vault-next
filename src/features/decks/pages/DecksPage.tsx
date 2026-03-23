import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecksStore } from '@/features/decks/store';
import { DeckCard } from '@/features/decks/components/DeckCard';
import { CreateDeckModal } from '@/features/decks/components/CreateDeckModal';
import { SearchInput } from '@/shared/components/ui/SearchInput';
import { Button } from '@/shared/components/ui/Button';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import styles from './DecksPage.module.css';

function DecksPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const decks = useDecksStore((s) => s.decks);
  const loading = useDecksStore((s) => s.loading);
  const searchQuery = useDecksStore((s) => s.searchQuery);
  const loadDecks = useDecksStore((s) => s.loadDecks);
  const createDeck = useDecksStore((s) => s.createDeck);
  const removeDeck = useDecksStore((s) => s.removeDeck);
  const toggleFavorite = useDecksStore((s) => s.toggleFavorite);
  const setSearchQuery = useDecksStore((s) => s.setSearchQuery);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return decks;
    const q = searchQuery.toLowerCase();
    return decks.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.format?.toLowerCase().includes(q),
    );
  }, [decks, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filtered]);

  const handleCreate = useCallback(
    async (name: string, description?: string, format?: string) => {
      const deck = await createDeck(name, description, format);
      navigate(`/decks/${deck.deckId}`);
    },
    [createDeck, navigate],
  );

  const handleDelete = useCallback(async () => {
    if (deleteId) {
      await removeDeck(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, removeDeck]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading decks...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search decks..."
          />
        </div>
        {!isMobile && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            New Deck
          </Button>
        )}
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 48, height: 48 }}>
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M12 12h.01" />
              <path d="M17 12h.01" />
              <path d="M7 12h.01" />
            </svg>
          }
          title={decks.length === 0 ? 'No decks yet' : 'No matching decks'}
          description={
            decks.length === 0
              ? 'Create your first deck to start building!'
              : 'Try adjusting your search to find what you\'re looking for.'
          }
          action={
            decks.length === 0 ? (
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create First Deck
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={styles.grid}>
          {sorted.map((deck) => (
            <DeckCard
              key={deck.deckId}
              deck={deck}
              onClick={() => navigate(`/decks/${deck.deckId}`)}
              onFavorite={() => toggleFavorite(deck.deckId)}
            />
          ))}
        </div>
      )}

      {isMobile && (
        <button
          className={styles.fab}
          onClick={() => setShowCreateModal(true)}
          aria-label="New deck"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}

      <CreateDeckModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Deck"
        message="Are you sure you want to delete this deck? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

export default DecksPage;
