import { z } from 'zod';

export const collectionEntrySchema = z.object({
  entryId: z.string().min(1),
  cardId: z.string().min(1),
  name: z.string().min(1).max(200),
  localeName: z.string().optional(),
  passcode: z.string().optional(),
  qty: z.number().int().min(0),
  setCode: z.string().optional(),
  setName: z.string().optional(),
  artworkId: z.string().optional(),
  rarity: z.string().optional(),
  mdRarity: z.string().optional(),
  finishType: z.string().optional(),
  archetype: z.string().optional(),
  typeLine: z.string().optional(),
  frameType: z.string().optional(),
  attribute: z.string().optional(),
  levelRankLink: z.number().int().nullable().optional(),
  atk: z.number().int().nullable().optional(),
  def: z.number().int().nullable().optional(),
  language: z.string().optional(),
  condition: z.string().optional(),
  edition: z.string().optional(),
  imageMode: z.enum(['official', 'custom']).optional(),
  customImageId: z.string().nullable().optional(),
  marketPrice: z.number().nullable().optional(),
  purchasePrice: z.number().nullable().optional(),
  targetPrice: z.number().nullable().optional(),
  priceSource: z.enum(['manual', 'auto', 'estimated']).nullable().optional(),
  priceUpdatedAt: z.string().nullable().optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string().max(40)).max(50).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CollectionEntry = z.infer<typeof collectionEntrySchema>;

/** Schema for creating a new entry (entryId, createdAt, updatedAt are generated). */
export const createCollectionEntrySchema = collectionEntrySchema.omit({
  entryId: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateCollectionEntry = z.infer<typeof createCollectionEntrySchema>;

/** Schema for updating an existing entry (all fields optional except entryId). */
export const updateCollectionEntrySchema = collectionEntrySchema
  .partial()
  .required({ entryId: true });

export type UpdateCollectionEntry = z.infer<typeof updateCollectionEntrySchema>;
