/**
 * Type guard utilities.
 */

/** Check that a value is not null or undefined. */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/** Check that a string is non-empty after trimming. */
export function isNonEmpty(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Type guard for string values. */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/** Type guard for number values (excludes NaN). */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/** Type guard for boolean values. */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/** Type guard for plain objects. */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Type guard for arrays. */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/** Assert a condition, throwing an error if false. */
export function assertDefined<T>(
  value: T | null | undefined,
  message = 'Expected value to be defined',
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}
