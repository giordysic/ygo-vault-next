import React from 'react';
import styles from './Tabs.module.css';

export interface Tab {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  const wrapperClasses = [styles.tabs, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            className={[styles.tab, isActive ? styles.active : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(tab.id)}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
