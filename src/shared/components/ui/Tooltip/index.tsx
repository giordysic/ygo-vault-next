import React from 'react';
import styles from './Tooltip.module.css';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: string;
  position?: TooltipPosition;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  className,
}) => {
  const wrapperClasses = [styles.wrapper, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <span className={wrapperClasses}>
      {children}
      <span
        className={[styles.tooltip, styles[position]].join(' ')}
        role="tooltip"
      >
        {content}
      </span>
    </span>
  );
};
