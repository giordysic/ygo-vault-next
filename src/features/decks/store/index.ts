import { create } from 'zustand';
import type { Deck, DeckCardRef } from '@/core/schemas/deck.schemas';
import { deckRepository } from '@/core/storage/repositories/deckRepository';
import { createDeckId } from '@/core/types/ids';
import { nowISO } from '@/core/utils/dates';

interface DecksState {
  decks: Deck[];
  loading: boolean;
  searchQuery: string;
}

interface DecksActions {
  loadDecks: () => Promise<void>;
  createDeck: (name: string, description?: string, format?: string) => Promise<Deck>;
  updateDeck: (deckId: string, changes: Partial<Deck>) => Promise<void>;
  removeDeck: (deckId: string) => Promise<void>;
  duplicateDeck: (deckId: string) => Promise<Deck | null>;
  toggleFavorite: (deckId: string) => Promise<void>;
  addCardToDeck: (deckId: string, card: DeckCardRef) => Promise<void>;
  removeCardFromDeck: (deckId: string, cardId: string, zone: string) => Promise<void>;
  updateCardInDeck: (deckId: string, cardId: string, zone: string, changes: Partial<DeckCardRef>) => Promise<void>;
  setSearchQuery: (query: string) => void;
}

type DecksStore = DecksState & DecksActions;

export const useDecksStore = create<DecksStore>()((set, get) => ({
  decks: [],
  loading: false,
  searchQuery: '',

  async loadDecks() {
    set({ loading: true });
    try {
      const decks = await deckRepository.getAll();
      set({ decks, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  async createDeck(name, description, format) {
    const now = nowISO();
    const deck: Deck = {
      deckId: createDeckId(),
      name,
      description,
      format,
      cards: [],
      tags: [],
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    };
    await deckRepository.add(deck);
    set((s) => ({ decks: [deck, ...s.decks] }));
    return deck;
  },

  async updateDeck(deckId, changes) {
    const updatedChanges = { ...changes, updatedAt: nowISO() };
    await deckRepository.update(deckId, updatedChanges);
    set((s) => ({
      decks: s.decks.map((d) =>
        d.deckId === deckId ? { ...d, ...updatedChanges } : d,
      ),
    }));
  },

  async removeDeck(deckId) {
    await deckRepository.remove(deckId);
    set((s) => ({ decks: s.decks.filter((d) => d.deckId !== deckId) }));
  },

  async duplicateDeck(deckId) {
    const source = get().decks.find((d) => d.deckId === deckId);
    if (!source) return null;
    const now = nowISO();
    const newDeck: Deck = {
      ...source,
      deckId: createDeckId(),
      name: `${source.name} (Copy)`,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    };
    await deckRepository.add(newDeck);
    set((s) => ({ decks: [newDeck, ...s.decks] }));
    return newDeck;
  },

  async toggleFavorite(deckId) {
    const deck = get().decks.find((d) => d.deckId === deckId);
    if (!deck) return;
    const isFavorite = !deck.isFavorite;
    await deckRepository.update(deckId, { isFavorite, updatedAt: nowISO() });
    set((s) => ({
      decks: s.decks.map((d) =>
        d.deckId === deckId ? { ...d, isFavorite } : d,
      ),
    }));
  },

  async addCardToDeck(deckId, card) {
    const deck = get().decks.find((d) => d.deckId === deckId);
    if (!deck) return;
    const existing = deck.cards.find(
      (c) => c.cardId === card.cardId && c.zone === card.zone,
    );
    let newCards: DeckCardRef[];
    if (existing) {
      newCards = deck.cards.map((c) =>
        c.cardId === card.cardId && c.zone === card.zone
          ? { ...c, qty: Math.min(3, c.qty + card.qty) }
          : c,
      );
    } else {
      newCards = [...deck.cards, card];
    }
    await deckRepository.update(deckId, { cards: newCards, updatedAt: nowISO() });
    set((s) => ({
      decks: s.decks.map((d) =>
        d.deckId === deckId ? { ...d, cards: newCards, updatedAt: nowISO() } : d,
      ),
    }));
  },

  async removeCardFromDeck(deckId, cardId, zone) {
    const deck = get().decks.find((d) => d.deckId === deckId);
    if (!deck) return;
    const newCards = deck.cards.filter(
      (c) => !(c.cardId === cardId && c.zone === zone),
    );
    await deckRepository.update(deckId, { cards: newCards, updatedAt: nowISO() });
    set((s) => ({
      decks: s.decks.map((d) =>
        d.deckId === deckId ? { ...d, cards: newCards, updatedAt: nowISO() } : d,
      ),
    }));
  },

  async updateCardInDeck(deckId, cardId, zone, changes) {
    const deck = get().decks.find((d) => d.deckId === deckId);
    if (!deck) return;
    const newCards = deck.cards.map((c) =>
      c.cardId === cardId && c.zone === zone ? { ...c, ...changes } : c,
    );
    await deckRepository.update(deckId, { cards: newCards, updatedAt: nowISO() });
    set((s) => ({
      decks: s.decks.map((d) =>
        d.deckId === deckId ? { ...d, cards: newCards, updatedAt: nowISO() } : d,
      ),
    }));
  },

  setSearchQuery(query) {
    set({ searchQuery: query });
  },
}));
