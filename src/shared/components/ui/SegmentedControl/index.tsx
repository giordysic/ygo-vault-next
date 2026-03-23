import React from 'react';
import styles from './SegmentedControl.module.css';

export interface SegmentedOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className,
}) => {
  const wrapperClasses = [styles.control, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses} role="radiogroup">
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            role="radio"
            className={[styles.segment, isSelected ? styles.selected : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(option.value)}
            aria-checked={isSelected}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
