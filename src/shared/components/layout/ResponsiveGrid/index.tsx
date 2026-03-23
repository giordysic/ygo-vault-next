import React from 'react';
import styles from './ResponsiveGrid.module.css';

export interface ResponsiveGridProps {
  minItemWidth?: string;
  gap?: string;
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  minItemWidth = '200px',
  gap,
  children,
  className,
}) => {
  const classNames = [styles.grid, className ?? '']
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties = {
    '--min-item-width': minItemWidth,
    ...(gap ? { gap } : {}),
  } as React.CSSProperties;

  return (
    <div className={classNames} style={style}>
      {children}
    </div>
  );
};
