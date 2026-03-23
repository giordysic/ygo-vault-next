import React from 'react';
import styles from './DataTable.module.css';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  onRowClick?: (row: T, index: number) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available',
  className,
}: DataTableProps<T>) {
  const classNames = [styles.wrapper, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={styles.th}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                className={styles.emptyCell}
                colSpan={columns.length}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={[styles.tr, onRowClick ? styles.clickableRow : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={styles.td}>
                    {col.render
                      ? col.render(row, rowIndex)
                      : (row[col.key] as React.ReactNode) ?? ''}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
