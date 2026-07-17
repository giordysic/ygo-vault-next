import { useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAnalyticsStore } from '@/features/analytics/store';
import { StatTile } from '@/shared/components/ui/StatTile';
import { Card } from '@/shared/components/ui/Card';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { timeAgo } from '@/core/utils/dates';
import styles from './AnalyticsPage.module.css';

const COLORS = [
  'var(--accent, #6366f1)',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#06b6d4',
  '#84cc16',
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

function AnalyticsPage() {
  const stats = useAnalyticsStore((s) => s.stats);
  const loading = useAnalyticsStore((s) => s.loading);
  const loadStats = useAnalyticsStore((s) => s.loadStats);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading && !stats) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading analytics...</div>
      </div>
    );
  }

  if (!stats || stats.uniqueCards === 0) {
    return (
      <div className={styles.page}>
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 48, height: 48 }}>
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          }
          title="No data yet"
          description="Add cards to your collection to see analytics and stats."
        />
      </div>
    );
  }

  const rarityData = stats.rarityDistribution.slice(0, 8);
  const typeData = stats.typeDistribution.slice(0, 8);

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Collection Analytics</h1>

      {/* Summary tiles */}
      <div className={styles.tilesGrid}>
        <StatTile label="Total Cards" value={stats.totalCards.toLocaleString()} />
        <StatTile label="Unique Cards" value={stats.uniqueCards.toLocaleString()} />
        <StatTile label="Collection Value" value={formatCurrency(stats.totalValue)} />
        <StatTile label="Avg. Card Value" value={formatCurrency(stats.averageValue)} />
        <StatTile label="Decks" value={stats.totalDecks} />
      </div>

      {/* Charts row */}
      <div className={styles.chartsGrid}>
        {/* Rarity Pie Chart */}
        {rarityData.length > 0 && (
          <Card variant="outlined" padding="md" className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Rarity Distribution</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={rarityData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {rarityData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Type Bar Chart */}
        {typeData.length > 0 && (
          <Card variant="outlined" padding="md" className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Card Types</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={typeData} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={75} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface-primary)', border: '1px solid var(--border)', borderRadius: 8 }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="count" fill="var(--accent, #6366f1)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {/* Growth chart */}
      {stats.collectionByMonth.length > 1 && (
        <Card variant="outlined" padding="md" className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Collection Growth</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stats.collectionByMonth}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent, #6366f1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent, #6366f1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-primary)', border: '1px solid var(--border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--accent, #6366f1)" fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Condition distribution */}
      {stats.conditionDistribution.length > 0 && (
        <Card variant="outlined" padding="md" className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Condition Distribution</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.conditionDistribution.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-primary)', border: '1px solid var(--border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Top value cards */}
      {stats.topValueCards.length > 0 && (
        <Card variant="outlined" padding="md">
          <h3 className={styles.chartTitle}>Most Valuable Cards</h3>
          <div className={styles.valueList}>
            {stats.topValueCards.map((card, i) => (
              <div key={i} className={styles.valueRow}>
                <span className={styles.valueRank}>#{i + 1}</span>
                <span className={styles.valueName}>{card.name}</span>
                <span className={styles.valuePrice}>{formatCurrency(card.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recently added */}
      {stats.recentlyAdded.length > 0 && (
        <Card variant="outlined" padding="md">
          <h3 className={styles.chartTitle}>Recently Added</h3>
          <div className={styles.valueList}>
            {stats.recentlyAdded.map((card, i) => (
              <div key={i} className={styles.valueRow}>
                <span className={styles.valueName}>{card.name}</span>
                <span className={styles.valueDate}>{timeAgo(card.date)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default AnalyticsPage;
