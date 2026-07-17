// ==========================================================================
// Toast Provider
// Context-based toast notification system with auto-dismiss.
// ==========================================================================

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  type?: ToastType;
  message: string;
  duration?: number;
}

interface ToastEntry {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toasts: ToastEntry[];
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 3000;

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const counterRef = useRef(0);

  const showToast = useCallback(
    ({ type = 'info', message, duration = DEFAULT_DURATION }: ToastOptions) => {
      const id = `toast-${++counterRef.current}`;
      const entry: ToastEntry = { id, type, message };

      setToasts((prev) => [...prev, entry]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    [],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, showToast }),
    [toasts, showToast],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
