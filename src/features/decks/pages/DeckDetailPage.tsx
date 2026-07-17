import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDecksStore } from '@/features/decks/store';
import type { DeckCardRef } from '@/core/schemas/deck.schemas';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Modal } from '@/shared/components/ui/Modal';
import { Tabs } from '@/shared/components/ui/Tabs';
import { useToast } from '@/shared/components/feedback/Toast';
import styles from './DeckDetailPage.module.css';

const ZONE_TABS = [
  { id: 'main', label: 'Main Deck' },
  { id: 'extra', label: 'Extra Deck' },
  { id: 'side', label: 'Side Deck' },
];

const ZONE_OPTIONS = [
  { value: 'main', label: 'Main Deck' },
  { value: 'extra', label: 'Extra Deck' },
  { value: 'side', label: 'Side Deck' },
];

function DeckDetailPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const decks = useDecksStore((s) => s.decks);
  const loading = useDecksStore((s) => s.loading);
  const loadDecks = useDecksStore((s) => s.loadDecks);
  const updateDeck = useDecksStore((s) => s.updateDeck);
  const removeDeck = useDecksStore((s) => s.removeDeck);
  const duplicateDeck = useDecksStore((s) => s.duplicateDeck);
  const toggleFavorite = useDecksStore((s) => s.toggleFavorite);
  const addCardToDeck = useDecksStore((s) => s.addCardToDeck);
  const removeCardFromDeck = useDecksStore((s) => s.removeCardFromDeck);
  const updateCardInDeck = useDecksStore((s) => s.updateCardInDeck);

  const [activeZone, setActiveZone] = useState('main');
  const [showAddCard, setShowAddCard] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');

  // Add card form state
  const [newCardName, setNewCardName] = useState('');
  const [newCardId, setNewCardId] = useState('');
  const [newCardZone, setNewCardZone] = useState<string>('main');
  const [newCardQty, setNewCardQty] = useState('1');

  useEffect(() => {
    if (decks.length === 0) loadDecks();
  }, [decks.length, loadDecks]);

  const deck = useMemo(() => decks.find((d) => d.deckId === deckId), [decks, deckId]);

  const zoneCards = useMemo(() => {
    if (!deck) return [];
    return deck.cards.filter((c) => c.zone === activeZone);
  }, [deck, activeZone]);

  const stats = useMemo(() => {
    if (!deck) return { main: 0, extra: 0, side: 0, total: 0, uniqueCards: 0 };
    const main = deck.cards.filter((c) => c.zone === 'main').reduce((s, c) => s + c.qty, 0);
    const extra = deck.cards.filter((c) => c.zone === 'extra').reduce((s, c) => s + c.qty, 0);
    const side = deck.cards.filter((c) => c.zone === 'side').reduce((s, c) => s + c.qty, 0);
    return { main, extra, side, total: main + extra + side, uniqueCards: deck.cards.length };
  }, [deck]);

  const handleSaveName = useCallback(async () => {
    if (!deck || !nameValue.trim()) return;
    await updateDeck(deck.deckId, { name: nameValue.trim() });
    setEditingName(false);
    addToast('success', 'Deck name updated');
  }, [deck, nameValue, updateDeck, addToast]);

  const handleAddCard = useCallback(async () => {
    if (!deck || !newCardName.trim()) return;
    const card: DeckCardRef = {
      cardId: newCardId.trim() || crypto.randomUUID(),
      name: newCardName.trim(),
      qty: Math.min(3, Math.max(1, parseInt(newCardQty) || 1)),
      zone: newCardZone as 'main' | 'extra' | 'side',
    };
    await addCardToDeck(deck.deckId, card);
    setNewCardName('');
    setNewCardId('');
    setNewCardQty('1');
    setShowAddCard(false);
    addToast('success', `${card.name} added to deck`);
  }, [deck, newCardName, newCardId, newCardZone, newCardQty, addCardToDeck, addToast]);

  const handleDeleteDeck = useCallback(async () => {
    if (!deck) return;
    await removeDeck(deck.deckId);
    addToast('success', 'Deck deleted');
    navigate('/decks');
  }, [deck, removeDeck, addToast, navigate]);

  const handleDuplicate = useCallback(async () => {
    if (!deck) return;
    const newDeck = await duplicateDeck(deck.deckId);
    if (newDeck) {
      addToast('success', 'Deck duplicated');
      navigate(`/decks/${newDeck.deckId}`);
    }
  }, [deck, duplicateDeck, addToast, navigate]);

  if (loading && !deck) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading deck...</div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className={styles.page}>
        <EmptyState
          title="Deck not found"
          description="This deck may have been deleted."
          action={
            <Button variant="secondary" onClick={() => navigate('/decks')}>
              Back to Decks
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/decks')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </Button>
        <div className={styles.titleArea}>
          {editingName ? (
            <div className={styles.nameEdit}>
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                autoFocus
              />
              <Button variant="primary" size="sm" onClick={handleSaveName}>Save</Button>
              <Button variant="ghost" size="sm" onClick={() => setEditingName(false)}>Cancel</Button>
            </div>
          ) : (
            <h1
              className={styles.title}
              onClick={() => { setNameValue(deck.name); setEditingName(true); }}
              title="Click to edit name"
            >
              {deck.name}
            </h1>
          )}
          {deck.format && <Badge variant="success" size="sm">{deck.format}</Badge>}
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFavorite(deck.deckId)}
            aria-label={deck.isFavorite ? 'Unfavorite' : 'Favorite'}
          >
            <svg viewBox="0 0 24 24" fill={deck.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDuplicate}>Duplicate</Button>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
        </div>
      </div>

      {deck.description && (
        <p className={styles.description}>{deck.description}</p>
      )}

      {/* Stats bar */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.main}</span>
          <span className={styles.statLabel}>Main</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.extra}</span>
          <span className={styles.statLabel}>Extra</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.side}</span>
          <span className={styles.statLabel}>Side</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.uniqueCards}</span>
          <span className={styles.statLabel}>Unique</span>
        </div>
      </div>

      {/* Zone tabs */}
      <div className={styles.zoneSection}>
        <div className={styles.zoneHeader}>
          <Tabs tabs={ZONE_TABS} activeTab={activeZone} onChange={setActiveZone} />
          <Button variant="primary" size="sm" onClick={() => { setNewCardZone(activeZone); setShowAddCard(true); }}>
            Add Card
          </Button>
        </div>

        {zoneCards.length === 0 ? (
          <EmptyState
            title={`No cards in ${activeZone} deck`}
            description="Add cards to start building this zone."
            action={
              <Button variant="secondary" size="sm" onClick={() => { setNewCardZone(activeZone); setShowAddCard(true); }}>
                Add Card
              </Button>
            }
          />
        ) : (
          <div className={styles.cardList}>
            {zoneCards.map((card) => (
              <div key={`${card.cardId}-${card.zone}`} className={styles.cardRow}>
                <div className={styles.cardInfo}>
                  <span className={styles.cardName}>{card.name}</span>
                  <span className={styles.cardId}>{card.cardId.slice(0, 8)}</span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.qtyButton}
                    onClick={() => {
                      if (card.qty > 1) {
                        updateCardInDeck(deck.deckId, card.cardId, card.zone, { qty: card.qty - 1 });
                      }
                    }}
                    disabled={card.qty <= 1}
                  >
                    -
                  </button>
                  <span className={styles.qtyValue}>{card.qty}</span>
                  <button
                    type="button"
                    className={styles.qtyButton}
                    onClick={() => {
                      if (card.qty < 3) {
                        updateCardInDeck(deck.deckId, card.cardId, card.zone, { qty: card.qty + 1 });
                      }
                    }}
                    disabled={card.qty >= 3}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeCardFromDeck(deck.deckId, card.cardId, card.zone)}
                    aria-label={`Remove ${card.name}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Card Modal */}
      <Modal
        isOpen={showAddCard}
        onClose={() => setShowAddCard(false)}
        title="Add Card to Deck"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowAddCard(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddCard} disabled={!newCardName.trim()}>Add</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Card Name"
            value={newCardName}
            onChange={(e) => setNewCardName(e.target.value)}
            placeholder="e.g. Blue-Eyes White Dragon"
            fullWidth
            autoFocus
          />
          <Input
            label="Card ID (optional)"
            value={newCardId}
            onChange={(e) => setNewCardId(e.target.value)}
            placeholder="e.g. 89631139"
            fullWidth
          />
          <Select
            label="Zone"
            options={ZONE_OPTIONS}
            value={newCardZone}
            onChange={(e) => setNewCardZone(e.target.value)}
          />
          <Input
            label="Quantity"
            type="number"
            min={1}
            max={3}
            value={newCardQty}
            onChange={(e) => setNewCardQty(e.target.value)}
            fullWidth
          />
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteDeck}
        title="Delete Deck"
        message={`Are you sure you want to delete "${deck.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

export default DeckDetailPage;
