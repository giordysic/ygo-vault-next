import React from 'react';
import styles from './InlineError.module.css';

export interface InlineErrorProps {
  message: string;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  className,
}) => {
  const classNames = [styles.error, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <p className={classNames} role="alert">
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {message}
    </p>
  );
};
