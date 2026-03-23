import React from 'react';
import styles from './Chip.module.css';

export interface ChipProps {
  label: string;
  onRemove?: () => void;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  onRemove,
  selected = false,
  onClick,
  className,
}) => {
  const classNames = [
    styles.chip,
    selected ? styles.selected : '',
    onClick ? styles.clickable : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={classNames}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <span className={styles.label}>{label}</span>
      {onRemove && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${label}`}
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
      )}
    </span>
  );
};
