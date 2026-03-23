import React from 'react';
import styles from './Textarea.module.css';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, rows = 4, className, id, ...rest }, ref) => {
    const textareaId = id ?? React.useId();

    const wrapperClasses = [styles.wrapper, className ?? '']
      .filter(Boolean)
      .join(' ');

    const textareaClasses = [styles.textarea, error ? styles.hasError : '']
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          rows={rows}
          aria-invalid={!!error || undefined}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : hint
                ? `${textareaId}-hint`
                : undefined
          }
          {...rest}
        />
        {error && (
          <p id={`${textareaId}-error`} className={styles.error} role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${textareaId}-hint`} className={styles.hint}>
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
