import { useRef, useState, useCallback } from 'react';
import { useExport } from '@/features/import-export/hooks/useExport';
import { useImport } from '@/features/import-export/hooks/useImport';
import { ImportPreview } from '@/features/import-export/components/ImportPreview';
import { Button } from '@/shared/components/ui/Button';
import styles from './ImportExportPage.module.css';

function ImportExportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const legacyInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const { exporting, error: exportError, exportAll, exportCollectionOnly } = useExport();
  const {
    importing,
    error: importError,
    preview,
    result,
    readFile,
    applyImport,
    clearPreview,
  } = useImport();

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (files && files.length > 0) {
        readFile(files[0]);
      }
    },
    [readFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const displayError = exportError || importError;

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Import / Export</h1>

      {/* Export Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Export</h2>
        <p className={styles.sectionDescription}>
          Download your collection data as a JSON file for backup or transfer.
        </p>
        <div className={styles.exportButtons}>
          <Button
            variant="primary"
            size="sm"
            onClick={exportAll}
            loading={exporting}
          >
            Export All Data
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={exportCollectionOnly}
            loading={exporting}
          >
            Export Collection Only
          </Button>
        </div>
      </div>

      {/* Import Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Import</h2>
        <p className={styles.sectionDescription}>
          Import a previously exported JSON file. You can merge with existing data or replace it entirely.
        </p>

        {!preview && (
          <div
            className={[
              styles.dropZone,
              dragActive ? styles.dropZoneActive : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Drop file or click to select"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <svg
              className={styles.dropIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className={styles.dropText}>
              Drop a JSON file here or click to browse
            </span>
            <span className={styles.dropHint}>Supports .json export files</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className={styles.hiddenInput}
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        {preview && (
          <ImportPreview
            payload={preview}
            importing={importing}
            onConfirm={applyImport}
            onCancel={clearPreview}
          />
        )}

        {result && (
          <div className={styles.result}>
            <span className={styles.resultTitle}>Import Successful</span>
            <span className={styles.resultDetail}>
              {result.entriesImported} entries imported, {result.entriesSkipped} skipped
            </span>
            <span className={styles.resultDetail}>
              {result.decksImported} decks imported, {result.decksSkipped} skipped
            </span>
            {result.settingsImported && (
              <span className={styles.resultDetail}>Settings imported</span>
            )}
            {result.warnings.length > 0 && (
              <span className={styles.resultDetail}>
                Warnings: {result.warnings.join(', ')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legacy Import */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Legacy Import</h2>
        <p className={styles.sectionDescription}>
          Import data from an older version or a different card manager format.
          The system will attempt to adapt the data automatically.
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => legacyInputRef.current?.click()}
        >
          Upload Legacy File
        </Button>
        <input
          ref={legacyInputRef}
          type="file"
          accept=".json,application/json"
          className={styles.hiddenInput}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {/* Errors */}
      {displayError && (
        <div className={styles.error}>{displayError}</div>
      )}
    </div>
  );
}

export default ImportExportPage;
