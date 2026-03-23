import { useState, useCallback, useMemo } from 'react';
import { collectionEntrySchema, type CollectionEntry, type CreateCollectionEntry } from '@/core/schemas/collection.schemas';
import type { ZodIssue } from 'zod';

// ---------------------------------------------------------------------------
// Form value type (everything optional except name / cardId / qty)
// ---------------------------------------------------------------------------

export interface CardFormValues {
  cardId: string;
  name: string;
  localeName: string;
  passcode: string;
  qty: number;
  setCode: string;
  setName: string;
  rarity: string;
  mdRarity: string;
  finishType: string;
  archetype: string;
  typeLine: string;
  frameType: string;
  attribute: string;
  levelRankLink: number | null;
  atk: number | null;
  def: number | null;
  language: string;
  condition: string;
  edition: string;
  imageMode: 'official' | 'custom';
  customImageId: string | null;
  marketPrice: number | null;
  purchasePrice: number | null;
  targetPrice: number | null;
  priceSource: 'manual' | 'auto' | 'estimated' | null;
  notes: string;
  tags: string[];
}

function createDefaults(): CardFormValues {
  return {
    cardId: '',
    name: '',
    localeName: '',
    passcode: '',
    qty: 1,
    setCode: '',
    setName: '',
    rarity: '',
    mdRarity: '',
    finishType: '',
    archetype: '',
    typeLine: '',
    frameType: '',
    attribute: '',
    levelRankLink: null,
    atk: null,
    def: null,
    language: 'en',
    condition: 'near-mint',
    edition: '',
    imageMode: 'official',
    customImageId: null,
    marketPrice: null,
    purchasePrice: null,
    targetPrice: null,
    priceSource: null,
    notes: '',
    tags: [],
  };
}

function fromEntry(entry: CollectionEntry): CardFormValues {
  return {
    cardId: entry.cardId,
    name: entry.name,
    localeName: entry.localeName ?? '',
    passcode: entry.passcode ?? '',
    qty: entry.qty,
    setCode: entry.setCode ?? '',
    setName: entry.setName ?? '',
    rarity: entry.rarity ?? '',
    mdRarity: entry.mdRarity ?? '',
    finishType: entry.finishType ?? '',
    archetype: entry.archetype ?? '',
    typeLine: entry.typeLine ?? '',
    frameType: entry.frameType ?? '',
    attribute: entry.attribute ?? '',
    levelRankLink: entry.levelRankLink ?? null,
    atk: entry.atk ?? null,
    def: entry.def ?? null,
    language: entry.language ?? 'en',
    condition: entry.condition ?? 'near-mint',
    edition: entry.edition ?? '',
    imageMode: entry.imageMode ?? 'official',
    customImageId: entry.customImageId ?? null,
    marketPrice: entry.marketPrice ?? null,
    purchasePrice: entry.purchasePrice ?? null,
    targetPrice: entry.targetPrice ?? null,
    priceSource: entry.priceSource ?? null,
    notes: entry.notes ?? '',
    tags: entry.tags ?? [],
  };
}

export interface UseCardFormReturn {
  values: CardFormValues;
  errors: Record<string, string>;
  isDirty: boolean;
  isValid: boolean;
  setField: <K extends keyof CardFormValues>(key: K, value: CardFormValues[K]) => void;
  setValues: (vals: Partial<CardFormValues>) => void;
  validate: () => boolean;
  getSubmitData: () => CreateCollectionEntry;
  reset: () => void;
}

export function useCardForm(existingEntry?: CollectionEntry): UseCardFormReturn {
  const initial = useMemo(
    () => (existingEntry ? fromEntry(existingEntry) : createDefaults()),
    [existingEntry],
  );

  const [values, setValuesState] = useState<CardFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  const setField = useCallback(<K extends keyof CardFormValues>(key: K, value: CardFormValues[K]) => {
    setValuesState((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    // Clear field error on change
    setErrors((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return prev;
    });
  }, []);

  const setValues = useCallback((partial: Partial<CardFormValues>) => {
    setValuesState((prev) => ({ ...prev, ...partial }));
    setDirty(true);
  }, []);

  const getSubmitData = useCallback((): CreateCollectionEntry => {
    const v = values;
    return {
      cardId: v.cardId || crypto.randomUUID(),
      name: v.name,
      localeName: v.localeName || undefined,
      passcode: v.passcode || undefined,
      qty: v.qty,
      setCode: v.setCode || undefined,
      setName: v.setName || undefined,
      rarity: v.rarity || undefined,
      mdRarity: v.mdRarity || undefined,
      finishType: v.finishType || undefined,
      archetype: v.archetype || undefined,
      typeLine: v.typeLine || undefined,
      frameType: v.frameType || undefined,
      attribute: v.attribute || undefined,
      levelRankLink: v.levelRankLink,
      atk: v.atk,
      def: v.def,
      language: v.language || undefined,
      condition: v.condition || undefined,
      edition: v.edition || undefined,
      imageMode: v.imageMode,
      customImageId: v.customImageId,
      marketPrice: v.marketPrice,
      purchasePrice: v.purchasePrice,
      targetPrice: v.targetPrice,
      priceSource: v.priceSource,
      notes: v.notes || undefined,
      tags: v.tags.length > 0 ? v.tags : undefined,
    };
  }, [values]);

  const validate = useCallback((): boolean => {
    const data = getSubmitData();
    // Validate against the entry schema (minus auto-generated fields)
    const testEntry = {
      ...data,
      entryId: 'temp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const result = collectionEntrySchema.safeParse(testEntry);
    if (result.success) {
      setErrors({});
      return true;
    }
    const newErrors: Record<string, string> = {};
    result.error.issues.forEach((issue: ZodIssue) => {
      const path = issue.path.join('.');
      if (!newErrors[path]) {
        newErrors[path] = issue.message;
      }
    });
    setErrors(newErrors);
    return false;
  }, [getSubmitData]);

  const isValid = useMemo(() => {
    return values.name.trim().length > 0 && values.qty >= 0;
  }, [values.name, values.qty]);

  const reset = useCallback(() => {
    setValuesState(initial);
    setErrors({});
    setDirty(false);
  }, [initial]);

  return {
    values,
    errors,
    isDirty: dirty,
    isValid,
    setField,
    setValues,
    validate,
    getSubmitData,
    reset,
  };
}
