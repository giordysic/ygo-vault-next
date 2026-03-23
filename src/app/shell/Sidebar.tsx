// ==========================================================================
// Sidebar
// Desktop-only collapsible navigation sidebar.
// ==========================================================================

import { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

function CollectionIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function DecksIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="1" width="12" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="5" y="4" width="12" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" fill="var(--bg-surface-1)" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="11" width="4" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="6" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="2" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ImportExportIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 10l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 6v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 1v2M10 17v2M1 10h2M17 10h2M3.93 3.93l1.41 1.41M14.66 14.66l1.41 1.41M3.93 16.07l1.41-1.41M14.66 5.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{
        transform: collapsed ? 'rotate(180deg)' : undefined,
        transition: `transform var(--duration-normal) var(--ease-out)`,
      }}
    >
      <path
        d="M10 4L6 8l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const navItems: NavItem[] = [
  { to: '/collection', label: 'Collection', icon: <CollectionIcon /> },
  { to: '/decks', label: 'Decks', icon: <DecksIcon /> },
  { to: '/analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
  { to: '/import-export', label: 'Import / Export', icon: <ImportExportIcon /> },
  { to: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const toggle = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
      aria-label="Sidebar navigation"
    >
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className={styles.icon}>{item.icon}</span>
            {!collapsed && <span className={styles.label}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        className={styles.collapseBtn}
        onClick={toggle}
        type="button"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <CollapseIcon collapsed={collapsed} />
        {!collapsed && <span className={styles.collapseLabel}>Collapse</span>}
      </button>
    </aside>
  );
}
