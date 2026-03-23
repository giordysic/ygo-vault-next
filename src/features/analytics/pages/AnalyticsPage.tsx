import styles from './AnalyticsPage.module.css';

function AnalyticsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.emptyState}>
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <h2 className={styles.title}>Analytics</h2>
        <p className={styles.description}>
          Collection analytics are coming soon. Track your collection value,
          rarity distribution, and growth over time.
        </p>
      </div>
    </div>
  );
}

export default AnalyticsPage;
