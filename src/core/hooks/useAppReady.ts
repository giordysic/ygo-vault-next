import { useState, useEffect } from 'react';
import { db } from '../storage/db';

/**
 * Hook that resolves to true once the database is open and hydrated.
 * Use this to gate rendering of the main app until storage is ready.
 */
export function useAppReady(): { isReady: boolean; error: Error | null } {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Ensure the database is open and accessible
        await db.open();
        if (!cancelled) {
          setIsReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error('Failed to initialize database'),
          );
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isReady, error };
}
