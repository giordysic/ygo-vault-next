import React from 'react';
import styles from './Skeleton.module.css';

type SkeletonVariant = 'text' | 'rect' | 'circle';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: SkeletonVariant;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = 'text',
  className,
}) => {
  const classNames = [styles.skeleton, styles[variant], className ?? '']
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return <div className={classNames} style={style} aria-hidden="true" />;
};
