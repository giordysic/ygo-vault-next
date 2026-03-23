import { useState, useCallback } from 'react';
import { exportService, type ExportOptions } from '@/core/services/importExport/exportService';

export interface UseExportReturn {
  exporting: boolean;
  error: string | null;
  exportAll: () => Promise<void>;
  exportCollectionOnly: () => Promise<void>;
}

export function useExport(): UseExportReturn {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doExport = useCallback(async (options: ExportOptions) => {
    setExporting(true);
    setError(null);
    try {
      await exportService.downloadExport(options);
    } catch (err) {
      setError((err as Error).message ?? 'Export failed');
    } finally {
      setExporting(false);
    }
  }, []);

  const exportAll = useCallback(() => {
    return doExport({ includeCollection: true, includeDecks: true, includeSettings: true });
  }, [doExport]);

  const exportCollectionOnly = useCallback(() => {
    return doExport({ includeCollection: true, includeDecks: false, includeSettings: false });
  }, [doExport]);

  return { exporting, error, exportAll, exportCollectionOnly };
}
