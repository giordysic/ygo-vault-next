// ==========================================================================
// Modal Provider
// Global modal management via React context.
// ==========================================================================

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface ModalEntry {
  id: string;
  props: Record<string, unknown>;
}

interface ModalContextValue {
  modals: ModalEntry[];
  openModal: (id: string, props?: Record<string, unknown>) => void;
  closeModal: (id: string) => void;
  closeAll: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return ctx;
}

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modals, setModals] = useState<ModalEntry[]>([]);

  const openModal = useCallback(
    (id: string, props: Record<string, unknown> = {}) => {
      setModals((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m.id === id)) return prev;
        return [...prev, { id, props }];
      });
    },
    [],
  );

  const closeModal = useCallback((id: string) => {
    setModals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const closeAll = useCallback(() => {
    setModals([]);
  }, []);

  const value = useMemo<ModalContextValue>(
    () => ({ modals, openModal, closeModal, closeAll }),
    [modals, openModal, closeModal, closeAll],
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
}
