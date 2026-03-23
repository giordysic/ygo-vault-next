import React from 'react';
import styles from './ActionBar.module.css';

export interface ActionBarAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export interface ActionBarProps {
  selectedCount: number;
  actions: ActionBarAction[];
  onClear: () => void;
  className?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  selectedCount,
  actions,
  onClear,
  className,
}) => {
  if (selectedCount === 0) return null;

  const classNames = [styles.bar, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} role="toolbar" aria-label="Bulk actions">
      <span className={styles.count}>
        {selectedCount} selected
      </span>
      <div className={styles.actions}>
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className={styles.actionButton}
            onClick={action.onClick}
          >
            {action.icon && (
              <span className={styles.actionIcon} aria-hidden="true">
                {action.icon}
              </span>
            )}
            {action.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={styles.clearButton}
        onClick={onClear}
        aria-label="Clear selection"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
