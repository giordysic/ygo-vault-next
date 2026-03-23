import React from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className,
  id,
}) => {
  const checkboxId = id ?? React.useId();

  const wrapperClasses = [
    styles.wrapper,
    disabled ? styles.disabled : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label htmlFor={checkboxId} className={wrapperClasses}>
      <input
        id={checkboxId}
        type="checkbox"
        className={styles.input}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span
        className={[styles.box, checked ? styles.checked : '']
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      >
        {checked && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};
