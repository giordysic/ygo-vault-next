import React from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'tonal';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      icon,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    const classNames = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth ? styles.fullWidth : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading ? (
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
        ) : icon ? (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {children && <span>{children}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
