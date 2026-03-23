import React from 'react';
import styles from './SearchInput.module.css';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, placeholder = 'Search...', className }, ref) => {
    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    const wrapperClasses = [styles.wrapper, className ?? '']
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        <svg
          className={styles.searchIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={ref}
          type="search"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        {value && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear search"
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
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';
