// ==========================================================================
// App – Root Component
// Wraps everything in providers and renders the router.
// ==========================================================================

import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { ModalProvider } from '@/app/providers/ModalProvider';
import { ToastProvider } from '@/app/providers/ToastProvider';
import { QueryBootstrap } from '@/app/providers/QueryBootstrap';
import { router } from '@/app/router';

export default function App() {
  return (
    <ThemeProvider>
      <ModalProvider>
        <ToastProvider>
          <QueryBootstrap>
            <RouterProvider router={router} />
          </QueryBootstrap>
        </ToastProvider>
      </ModalProvider>
    </ThemeProvider>
  );
}
