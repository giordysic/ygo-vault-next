import { create } from 'zustand';
import type { CollectionEntry } from '@/core/schemas/collection.schemas';
import { collectionRepository } from '@/core/storage/repositories/collectionRepository';
import { deckRepository } from '@/core/storage/repositories/deckRepository';

export interface CollectionStats {
  totalCards: number;
  uniqueCards: number;
  totalValue: number;
  averageValue: number;
  totalDecks: number;
  rarityDistribution: { name: string; count: number }[];
  typeDistribution: { name: string; count: number }[];
  conditionDistribution: { name: string; count: number }[];
  topValueCards: { name: string; value: number }[];
  recentlyAdded: { name: string; date: string }[];
  collectionByMonth: { month: string; count: number }[];
}

interface AnalyticsState {
  stats: CollectionStats | null;
  loading: boolean;
}

interface AnalyticsActions {
  loadStats: () => Promise<void>;
}

type AnalyticsStore = AnalyticsState & AnalyticsActions;

function buildDistribution(entries: CollectionEntry[], field: keyof CollectionEntry): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const entry of entries) {
    const val = (entry[field] as string) || 'Unknown';
    map.set(val, (map.get(val) ?? 0) + entry.qty);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function buildMonthlyGrowth(entries: CollectionEntry[]): { month: string; count: number }[] {
  const map = new Map<string, number>();
  for (const entry of entries) {
    const d = new Date(entry.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) ?? 0) + entry.qty);
  }
  return Array.from(map.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export const useAnalyticsStore = create<AnalyticsStore>()((set) => ({
  stats: null,
  loading: false,

  async loadStats() {
    set({ loading: true });
    try {
      const [entries, deckCount] = await Promise.all([
        collectionRepository.getAll(),
        deckRepository.count(),
      ]);

      const totalCards = entries.reduce((sum, e) => sum + e.qty, 0);
      const uniqueCards = entries.length;
      const totalValue = entries.reduce((sum, e) => sum + (e.marketPrice ?? 0) * e.qty, 0);
      const averageValue = uniqueCards > 0 ? totalValue / uniqueCards : 0;

      const topValueCards = [...entries]
        .filter((e) => e.marketPrice && e.marketPrice > 0)
        .sort((a, b) => (b.marketPrice ?? 0) - (a.marketPrice ?? 0))
        .slice(0, 10)
        .map((e) => ({ name: e.name, value: e.marketPrice ?? 0 }));

      const recentlyAdded = [...entries]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((e) => ({ name: e.name, date: e.createdAt }));

      const stats: CollectionStats = {
        totalCards,
        uniqueCards,
        totalValue,
        averageValue,
        totalDecks: deckCount,
        rarityDistribution: buildDistribution(entries, 'rarity'),
        typeDistribution: buildDistribution(entries, 'typeLine'),
        conditionDistribution: buildDistribution(entries, 'condition'),
        topValueCards,
        recentlyAdded,
        collectionByMonth: buildMonthlyGrowth(entries),
      };

      set({ stats, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
