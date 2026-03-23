import React from 'react';
import styles from './StatTile.module.css';

export interface StatTileProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  icon,
  trend,
  className,
}) => {
  const classNames = [styles.tile, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {trend && (
          <span
            className={[styles.trend, styles[trend]].join(' ')}
            aria-hidden="true"
          >
            {trend === 'up' && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 15l-6-6-6 6" />
              </svg>
            )}
            {trend === 'down' && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            )}
            {trend === 'neutral' && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
              </svg>
            )}
          </span>
        )}
      </div>
    </div>
  );
};
