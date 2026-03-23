/** Sort direction for list queries. */
export type SortDirection = 'asc' | 'desc';

/** Display mode for collection views. */
export type ViewMode = 'grid' | 'list';

/** Card size preset. */
export type CardSize = 'compact' | 'normal' | 'large';

/** Filter comparison operators. */
export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'startsWith'
  | 'in'
  | 'notIn';

/** A single filter criterion. */
export interface FilterCriterion {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

/** Sort specification. */
export interface SortSpec {
  field: string;
  direction: SortDirection;
}

/** Paginated query parameters. */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** Paginated response wrapper. */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Generic key-value pair. */
export interface KeyValue<V = string> {
  key: string;
  value: V;
}

/** Result type for operations that can fail gracefully. */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/** Image display mode. */
export type ImageMode = 'official' | 'custom';

/** Price source type. */
export type PriceSource = 'manual' | 'auto' | 'estimated';

/** Card condition grades. */
export type CardCondition =
  | 'mint'
  | 'near-mint'
  | 'lightly-played'
  | 'moderately-played'
  | 'heavily-played'
  | 'damaged';

/** Card edition types. */
export type CardEdition = '1st' | 'unlimited' | 'limited';

/** Import strategy. */
export type ImportStrategy = 'merge' | 'replace';

/** Analytics mode. */
export type AnalyticsMode = 'simple' | 'advanced';

/** Theme mode. */
export type ThemeMode = 'light' | 'dark';
