/**
 * Application error types and helpers.
 */

export type ErrorCode =
  | 'UNKNOWN'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'STORAGE'
  | 'IMPORT'
  | 'EXPORT'
  | 'MEDIA'
  | 'SEARCH'
  | 'LIMIT_EXCEEDED'
  | 'SCHEMA_MISMATCH';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: unknown;
  public readonly timestamp: string;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace in V8 environments
    if ('captureStackTrace' in Error) {
      (Error as unknown as { captureStackTrace: (target: object, constructor: Function) => void })
        .captureStackTrace(this, AppError);
    }
  }
}

/** Create a typed AppError. */
export function createError(
  code: ErrorCode,
  message: string,
  details?: unknown,
): AppError {
  return new AppError(code, message, details);
}

/** Wrap an unknown thrown value into an AppError. */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (err instanceof Error) {
    return new AppError('UNKNOWN', err.message, { originalError: err.name });
  }
  return new AppError('UNKNOWN', String(err));
}

/** Check if a value is an AppError with a specific code. */
export function isAppError(value: unknown, code?: ErrorCode): value is AppError {
  if (!(value instanceof AppError)) return false;
  return code ? value.code === code : true;
}
