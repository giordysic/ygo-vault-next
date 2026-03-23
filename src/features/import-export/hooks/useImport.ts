import { useState, useCallback } from 'react';
import { importService } from '@/core/services/importExport/importService';
import type { ImportPayload, ImportResult } from '@/core/schemas/import.schemas';
import type { ImportStrategy } from '@/core/types/common';

export interface UseImportReturn {
  importing: boolean;
  error: string | null;
  preview: ImportPayload | null;
  result: ImportResult | null;
  readFile: (file: File) => Promise<void>;
  applyImport: (strategy: ImportStrategy) => Promise<void>;
  clearPreview: () => void;
}

export function useImport(): UseImportReturn {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPayload | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const readFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    setPreview(null);

    try {
      const text = await file.text();

      // Try standard format first
      let payload: ImportPayload;
      try {
        payload = importService.parsePayload(text);
      } catch {
        // Try legacy format
        const parsed = JSON.parse(text);
        const adapted = importService.adaptLegacyPayload(parsed);
        if (!adapted) {
          throw new Error('Unrecognized import file format.');
        }
        payload = adapted;
      }

      setPreview(payload);
    } catch (err) {
      setError((err as Error).message ?? 'Failed to read file');
    }
  }, []);

  const applyImport = useCallback(
    async (strategy: ImportStrategy) => {
      if (!preview) return;
      setImporting(true);
      setError(null);
      try {
        const importResult = await importService.importData(preview, strategy);
        setResult(importResult);
        setPreview(null);
      } catch (err) {
        setError((err as Error).message ?? 'Import failed');
      } finally {
        setImporting(false);
      }
    },
    [preview],
  );

  const clearPreview = useCallback(() => {
    setPreview(null);
    setError(null);
    setResult(null);
  }, []);

  return { importing, error, preview, result, readFile, applyImport, clearPreview };
}
