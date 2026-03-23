import React, { useState } from 'react';
import styles from './Section.module.css';

export interface SectionProps {
  title?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  title,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const classNames = [styles.section, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classNames}>
      {title && (
        <div className={styles.header}>
          {collapsible ? (
            <button
              type="button"
              className={styles.collapseButton}
              onClick={() => setCollapsed((prev) => !prev)}
              aria-expanded={!collapsed}
            >
              <svg
                className={[
                  styles.chevron,
                  collapsed ? styles.collapsed : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
              <span className={styles.title}>{title}</span>
            </button>
          ) : (
            <h3 className={styles.title}>{title}</h3>
          )}
        </div>
      )}
      {!collapsed && <div className={styles.content}>{children}</div>}
    </section>
  );
};
