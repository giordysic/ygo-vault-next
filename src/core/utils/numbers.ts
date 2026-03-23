/**
 * Number utility helpers.
 */

/** Clamp a number between min and max (inclusive). */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Calculate percentage (0-100). Returns 0 when total is 0. */
export function percent(part: number, total: number, decimals = 1): number {
  if (total === 0) return 0;
  return parseFloat(((part / total) * 100).toFixed(decimals));
}

/** Sum an array of numbers. */
export function sum(values: readonly number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

/** Sum a specific numeric field from an array of objects. */
export function sumBy<T>(arr: readonly T[], fn: (item: T) => number): number {
  return arr.reduce((acc, item) => acc + fn(item), 0);
}

/** Round to a given number of decimal places. */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
