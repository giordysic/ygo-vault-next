import React from 'react';
import styles from './Toggle.module.css';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className,
  id,
}) => {
  const toggleId = id ?? React.useId();

  const wrapperClasses = [
    styles.wrapper,
    disabled ? styles.disabled : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label htmlFor={toggleId} className={wrapperClasses}>
      <input
        id={toggleId}
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        aria-checked={checked}
      />
      <span
        className={[styles.track, checked ? styles.checked : '']
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      >
        <span className={styles.thumb} />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};
