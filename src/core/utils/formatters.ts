/**
 * Formatting utilities for display values.
 */

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currency: string): Intl.NumberFormat {
  let fmt = currencyFormatters.get(currency);
  if (!fmt) {
    fmt = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    currencyFormatters.set(currency, fmt);
  }
  return fmt;
}

/** Format a numeric price for display. Returns '--' for null/undefined. */
export function formatPrice(
  value: number | null | undefined,
  currency = 'USD',
): string {
  if (value == null) return '--';
  return getCurrencyFormatter(currency).format(value);
}

/** Format a date string for display. */
export function formatDate(
  isoString: string | null | undefined,
  style: 'short' | 'medium' | 'long' = 'medium',
): string {
  if (!isoString) return '--';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '--';

  const options: Intl.DateTimeFormatOptions =
    style === 'short'
      ? { month: 'numeric', day: 'numeric', year: '2-digit' }
      : style === 'long'
        ? { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }
        : { month: 'short', day: 'numeric', year: 'numeric' };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/** Format a quantity for display. Adds 'x' prefix. */
export function formatQty(qty: number): string {
  return `x${qty}`;
}

/** Truncate text to a maximum length, appending ellipsis if needed. */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trimEnd() + '\u2026';
}
