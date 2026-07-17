/* eslint-disable react-refresh/only-export-components */
// ==========================================================================
// App Router
// React Router configuration with lazy-loaded routes and AppShell layout.
// ==========================================================================

import { lazy, Suspense, type ReactNode } from 'react';
import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from 'react-router-dom';
import { AppShell } from '@/app/shell/AppShell';
import { NotFoundPage } from '@/app/pages/NotFoundPage';

// ---------------------------------------------------------------------------
// Lazy-loaded page components
// ---------------------------------------------------------------------------

const CollectionPage = lazy(
  () => import('@/features/collection/pages/CollectionPage'),
);
const CardEditorPage = lazy(
  () => import('@/features/card-editor/pages/CardEditorPage'),
);
const CardDetailPage = lazy(
  () => import('@/features/card-detail/pages/CardDetailPage'),
);
const DecksPage = lazy(() => import('@/features/decks/pages/DecksPage'));
const DeckDetailPage = lazy(
  () => import('@/features/decks/pages/DeckDetailPage'),
);
const AnalyticsPage = lazy(
  () => import('@/features/analytics/pages/AnalyticsPage'),
);
const ImportExportPage = lazy(
  () => import('@/features/import-export/pages/ImportExportPage'),
);
const SettingsPage = lazy(
  () => import('@/features/settings/pages/SettingsPage'),
);
// ---------------------------------------------------------------------------
// Suspense wrapper for lazy pages
// ---------------------------------------------------------------------------

function LazyPage({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-sm)',
          }}
        >
          Loading...
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

// ---------------------------------------------------------------------------
// Route definitions
// ---------------------------------------------------------------------------

const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/collection" replace />,
      },
      {
        path: 'collection',
        element: (
          <LazyPage>
            <CollectionPage />
          </LazyPage>
        ),
      },
      {
        path: 'collection/add',
        element: (
          <LazyPage>
            <CardEditorPage />
          </LazyPage>
        ),
      },
      {
        path: 'collection/:entryId',
        element: (
          <LazyPage>
            <CardDetailPage />
          </LazyPage>
        ),
      },
      {
        path: 'collection/:entryId/edit',
        element: (
          <LazyPage>
            <CardEditorPage />
          </LazyPage>
        ),
      },
      {
        path: 'decks',
        element: (
          <LazyPage>
            <DecksPage />
          </LazyPage>
        ),
      },
      {
        path: 'decks/:deckId',
        element: (
          <LazyPage>
            <DeckDetailPage />
          </LazyPage>
        ),
      },
      {
        path: 'analytics',
        element: (
          <LazyPage>
            <AnalyticsPage />
          </LazyPage>
        ),
      },
      {
        path: 'import-export',
        element: (
          <LazyPage>
            <ImportExportPage />
          </LazyPage>
        ),
      },
      {
        path: 'settings',
        element: (
          <LazyPage>
            <SettingsPage />
          </LazyPage>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
