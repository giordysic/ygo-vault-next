// ==========================================================================
// App Header
// Top bar with app title and theme toggle.
// ==========================================================================

import { useTheme } from '@/app/providers/ThemeProvider';
import styles from './AppHeader.module.css';

export function AppHeader() {
  const { themeMode, toggleMode } = useTheme();

  return (
    <header className={styles.header}>
      <div className={styles.title}>YGO Vault</div>
      <button
        className={styles.themeToggle}
        onClick={toggleMode}
        aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
        type="button"
      >
        {themeMode === 'dark' ? (
          /* Sun icon for switching to light */
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="4" fill="currentColor" />
            <path
              d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          /* Moon icon for switching to dark */
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M17.29 13.35A8 8 0 0 1 6.65 2.71 8 8 0 1 0 17.29 13.35Z"
              fill="currentColor"
            />
          </svg>
        )}
      </button>
    </header>
  );
}
