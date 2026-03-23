// ==========================================================================
// Bottom Navigation
// Mobile-only bottom tab bar with 5 navigation items (Collection, Decks,
// Add center FAB, Analytics, Settings).
// ==========================================================================

import { NavLink, useNavigate } from 'react-router-dom';
import styles from './BottomNav.module.css';

function CollectionIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="12" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12" y="12" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function DecksIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="4" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="5" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="var(--bg-app)" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="12" width="4" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="7" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="15" y="3" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11 2v2M11 18v2M2 11h2M18 11h2M4.93 4.93l1.41 1.41M15.66 15.66l1.41 1.41M4.93 17.07l1.41-1.41M15.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <NavLink
        to="/collection"
        className={({ isActive }) =>
          `${styles.tab} ${isActive ? styles.active : ''}`
        }
      >
        <CollectionIcon />
        <span className={styles.label}>Collection</span>
      </NavLink>

      <NavLink
        to="/decks"
        className={({ isActive }) =>
          `${styles.tab} ${isActive ? styles.active : ''}`
        }
      >
        <DecksIcon />
        <span className={styles.label}>Decks</span>
      </NavLink>

      <button
        className={styles.fab}
        onClick={() => navigate('/collection/add')}
        aria-label="Add card"
        type="button"
      >
        <AddIcon />
      </button>

      <NavLink
        to="/analytics"
        className={({ isActive }) =>
          `${styles.tab} ${isActive ? styles.active : ''}`
        }
      >
        <AnalyticsIcon />
        <span className={styles.label}>Analytics</span>
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `${styles.tab} ${isActive ? styles.active : ''}`
        }
      >
        <SettingsIcon />
        <span className={styles.label}>Settings</span>
      </NavLink>
    </nav>
  );
}
