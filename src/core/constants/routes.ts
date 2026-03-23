export const ROUTES = {
  COLLECTION: '/',
  COLLECTION_ADD: '/collection/add',
  COLLECTION_ENTRY: '/collection/:entryId',
  COLLECTION_ENTRY_EDIT: '/collection/:entryId/edit',
  DECKS: '/decks',
  DECK_DETAIL: '/decks/:deckId',
  ANALYTICS: '/analytics',
  IMPORT_EXPORT: '/import-export',
  SETTINGS: '/settings',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/** Build a parameterized route path. */
export function buildRoute(
  route: typeof ROUTES.COLLECTION_ENTRY | typeof ROUTES.COLLECTION_ENTRY_EDIT,
  params: { entryId: string },
): string;
export function buildRoute(
  route: typeof ROUTES.DECK_DETAIL,
  params: { deckId: string },
): string;
export function buildRoute(
  route: string,
  params: Record<string, string>,
): string {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(value)),
    route,
  );
}
