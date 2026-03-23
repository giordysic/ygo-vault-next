// ==========================================================================
// Global Overlays
// Renders modal stack and toast notification container at the shell level.
// ==========================================================================

import { useModal } from '@/app/providers/ModalProvider';
import { useToast, type ToastType } from '@/app/providers/ToastProvider';

// ---------------------------------------------------------------------------
// Toast rendering
// ---------------------------------------------------------------------------

const toastColorMap: Record<ToastType, string> = {
  success: 'var(--success)',
  error: 'var(--danger)',
  warning: 'var(--warning)',
  info: 'var(--info)',
};

function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 'var(--space-4)',
        right: 'var(--space-4)',
        left: 'var(--space-4)',
        zIndex: 'var(--z-toast)' as unknown as number,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-soft)',
            boxShadow: 'var(--shadow-lg)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-sm)',
            maxWidth: '420px',
            width: '100%',
            pointerEvents: 'auto',
            animation: 'slideDown var(--duration-slow) var(--ease-out)',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 'var(--radius-full)',
              backgroundColor: toastColorMap[toast.type],
              flexShrink: 0,
            }}
          />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal rendering
// ---------------------------------------------------------------------------

function ModalContainer() {
  const { modals, closeModal } = useModal();

  if (modals.length === 0) return null;

  return (
    <>
      {modals.map((modal) => (
        <div
          key={modal.id}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--z-modal)' as unknown as number,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'var(--bg-overlay)',
              animation: 'fadeIn var(--duration-normal) var(--ease-out)',
            }}
            onClick={() => closeModal(modal.id)}
            aria-hidden="true"
          />
          {/* Placeholder modal body – real content will be registered later */}
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'relative',
              backgroundColor: 'var(--bg-modal)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-soft)',
              boxShadow: 'var(--shadow-xl)',
              padding: 'var(--space-6)',
              maxWidth: '90vw',
              maxHeight: '85vh',
              overflow: 'auto',
              animation: 'scaleIn var(--duration-slow) var(--ease-out)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-sm)',
            }}
          >
            <p>Modal: {modal.id}</p>
            <pre style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
              {JSON.stringify(modal.props, null, 2)}
            </pre>
          </div>
        </div>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Composite
// ---------------------------------------------------------------------------

export function GlobalOverlays() {
  return (
    <>
      <ModalContainer />
      <ToastContainer />
    </>
  );
}
