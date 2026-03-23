/**
 * Array utility helpers.
 */

/** Split an array into chunks of the given size. */
export function chunk<T>(arr: readonly T[], size: number): T[][] {
  if (size <= 0) return [];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/** Return unique elements based on an optional key function. */
export function unique<T>(arr: readonly T[], keyFn?: (item: T) => unknown): T[] {
  if (!keyFn) return [...new Set(arr)];
  const seen = new Set<unknown>();
  return arr.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Group array elements by a key function. */
export function groupBy<T>(arr: readonly T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const key = keyFn(item);
    (result[key] ??= []).push(item);
  }
  return result;
}

/** Sort an array by a comparable key. Returns a new array. */
export function sortBy<T>(
  arr: readonly T[],
  keyFn: (item: T) => string | number,
  direction: 'asc' | 'desc' = 'asc',
): T[] {
  const multiplier = direction === 'asc' ? 1 : -1;
  return [...arr].sort((a, b) => {
    const ka = keyFn(a);
    const kb = keyFn(b);
    if (ka < kb) return -1 * multiplier;
    if (ka > kb) return 1 * multiplier;
    return 0;
  });
}

/** Flatten an array one level deep. */
export function flatten<T>(arr: readonly (T | T[])[]): T[] {
  return arr.flat() as T[];
}

/** Return the first element matching a predicate, or undefined. */
export function findFirst<T>(arr: readonly T[], predicate: (item: T) => boolean): T | undefined {
  return arr.find(predicate);
}
