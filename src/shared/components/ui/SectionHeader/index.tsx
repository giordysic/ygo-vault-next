import React from 'react';
import styles from './SectionHeader.module.css';

export interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  count?: number;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  action,
  count,
  className,
}) => {
  const classNames = [styles.header, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <div className={styles.titleRow}>
        <h3 className={styles.title}>{title}</h3>
        {count !== undefined && (
          <span className={styles.count}>{count}</span>
        )}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};
