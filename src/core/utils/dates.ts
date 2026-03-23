/**
 * Date utilities built on date-fns.
 */

import { parseISO, differenceInDays, differenceInHours, formatDistanceToNow } from 'date-fns';

/** Return the current time as an ISO 8601 string. */
export function nowISO(): string {
  return new Date().toISOString();
}

/** Parse an ISO date string into a Date object. Returns null on invalid input. */
export function parseDate(isoString: string | null | undefined): Date | null {
  if (!isoString) return null;
  try {
    const d = parseISO(isoString);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/** Check if a date string is older than the given number of days. */
export function isOlderThan(isoString: string | null | undefined, days: number): boolean {
  const d = parseDate(isoString);
  if (!d) return true;
  return differenceInDays(new Date(), d) >= days;
}

/** Check if a date string is older than the given number of hours. */
export function isOlderThanHours(isoString: string | null | undefined, hours: number): boolean {
  const d = parseDate(isoString);
  if (!d) return true;
  return differenceInHours(new Date(), d) >= hours;
}

/** Get a human-readable relative time string (e.g. "3 days ago"). */
export function timeAgo(isoString: string | null | undefined): string {
  const d = parseDate(isoString);
  if (!d) return 'unknown';
  return formatDistanceToNow(d, { addSuffix: true });
}
