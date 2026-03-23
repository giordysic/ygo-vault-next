import React from 'react';
import styles from './Radio.module.css';

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  disabled?: boolean;
  className?: string;
}

export const Radio: React.FC<RadioProps> = ({
  options,
  value,
  onChange,
  name,
  disabled = false,
  className,
}) => {
  const groupClasses = [
    styles.group,
    disabled ? styles.disabled : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={groupClasses} role="radiogroup">
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              className={styles.input}
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              disabled={disabled}
            />
            <span
              className={[styles.circle, isSelected ? styles.selected : '']
                .filter(Boolean)
                .join(' ')}
              aria-hidden="true"
            >
              {isSelected && <span className={styles.dot} />}
            </span>
            <span className={styles.label}>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
};
