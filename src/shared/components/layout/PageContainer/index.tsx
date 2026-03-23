import React from 'react';
import styles from './PageContainer.module.css';

export interface PageContainerProps {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  noPadding = false,
  className,
}) => {
  const classNames = [
    styles.container,
    noPadding ? styles.noPadding : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      {(title || headerAction) && (
        <div className={styles.header}>
          <div className={styles.headerText}>
            {title && <h1 className={styles.title}>{title}</h1>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {headerAction && (
            <div className={styles.headerAction}>{headerAction}</div>
          )}
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
};
