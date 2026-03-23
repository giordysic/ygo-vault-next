import React from 'react';
import styles from './Progress.module.css';

type ProgressSize = 'sm' | 'md' | 'lg';
type ProgressVariant = 'default' | 'success' | 'warning' | 'danger';

export interface ProgressProps {
  value: number;
  size?: ProgressSize;
  variant?: ProgressVariant;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  size = 'md',
  variant = 'default',
  className,
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const classNames = [styles.track, styles[size], className ?? '']
    .filter(Boolean)
    .join(' ');

  const barClasses = [styles.bar, styles[variant]].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={barClasses}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
