import { z } from 'zod';

export const deckCardRefSchema = z.object({
  cardId: z.string().min(1),
  name: z.string().min(1),
  qty: z.number().int().min(1).max(3),
  zone: z.enum(['main', 'extra', 'side']),
  artworkId: z.string().optional(),
  notes: z.string().optional(),
});

export type DeckCardRef = z.infer<typeof deckCardRefSchema>;

export const deckSchema = z.object({
  deckId: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  format: z.string().optional(),
  coverCardId: z.string().optional(),
  cards: z.array(deckCardRefSchema),
  tags: z.array(z.string().max(40)).max(50).optional(),
  isFavorite: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Deck = z.infer<typeof deckSchema>;

/** Schema for creating a new deck (deckId, createdAt, updatedAt are generated). */
export const createDeckSchema = deckSchema.omit({
  deckId: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateDeck = z.infer<typeof createDeckSchema>;

/** Schema for updating an existing deck. */
export const updateDeckSchema = deckSchema.partial().required({ deckId: true });

export type UpdateDeck = z.infer<typeof updateDeckSchema>;
