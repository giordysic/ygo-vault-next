import React from 'react';
import styles from './LoadingScreen.module.css';

export interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className={styles.wrapper} role="status" aria-label="Loading">
      <svg
        className={styles.spinner}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="42"
          strokeDashoffset="14"
        />
      </svg>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};
