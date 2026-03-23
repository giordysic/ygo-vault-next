import React from 'react';
import styles from './IconButton.module.css';

type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'tonal';
type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  icon: React.ReactNode;
  label: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'ghost',
      size = 'md',
      icon,
      label,
      disabled = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const classNames = [
      styles.iconButton,
      styles[variant],
      styles[size],
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled}
        aria-label={label}
        {...rest}
      >
        {icon}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';
