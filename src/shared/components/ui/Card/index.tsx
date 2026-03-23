import React from 'react';
import styles from './Card.module.css';

type CardVariant = 'flat' | 'elevated' | 'outlined' | 'interactive' | 'premium';

export interface CardProps {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'flat',
  padding = 'md',
  onClick,
  children,
  className,
}) => {
  const classNames = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    onClick ? styles.clickable : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={classNames}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </Component>
  );
};
