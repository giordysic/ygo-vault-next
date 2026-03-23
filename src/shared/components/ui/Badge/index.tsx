import React from 'react';
import styles from './Badge.module.css';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className,
}) => {
  const classNames = [styles.badge, styles[variant], styles[size], className ?? '']
    .filter(Boolean)
    .join(' ');

  return <span className={classNames}>{children}</span>;
};
