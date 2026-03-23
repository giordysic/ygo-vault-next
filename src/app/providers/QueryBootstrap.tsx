// ==========================================================================
// Query Bootstrap
// Hydrates initial data on app start (settings from IndexedDB into Zustand).
// Shows a loading screen until the app is ready.
// ==========================================================================

import { useEffect, useState, type ReactNode } from 'react';
import { useSettingsStore } from '@/features/settings/store';

interface QueryBootstrapProps {
  children: ReactNode;
}

function LoadingScreen() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid var(--border-soft)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto var(--space-4)',
          }}
        />
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
          }}
        >
          Loading YGO Vault...
        </p>
      </div>
    </div>
  );
}

export function QueryBootstrap({ children }: QueryBootstrapProps) {
  const [appReady, setAppReady] = useState(false);
  const hydrate = useSettingsStore((s) => s.hydrate);
  const hydrated = useSettingsStore((s) => s.hydrated);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await hydrate();
      } catch (err) {
        console.error('[QueryBootstrap] Failed to hydrate settings:', err);
      } finally {
        if (!cancelled) {
          setAppReady(true);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  if (!appReady || !hydrated) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
