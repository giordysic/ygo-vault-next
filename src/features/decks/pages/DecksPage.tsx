import styles from './DecksPage.module.css';

function DecksPage() {
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
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <path d="M12 12h.01" />
          <path d="M17 12h.01" />
          <path d="M7 12h.01" />
        </svg>
        <h2 className={styles.title}>Deck Builder</h2>
        <p className={styles.description}>
          The Deck Builder is coming soon. You will be able to create, edit,
          and manage your Yu-Gi-Oh! decks right here.
        </p>
      </div>
    </div>
  );
}

export default DecksPage;
