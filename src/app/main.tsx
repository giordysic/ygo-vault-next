// ==========================================================================
// Entry Point
// Bootstraps the React application into the DOM.
// ==========================================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Global styles (order matters)
import '@/shared/styles/reset.css';
import '@/shared/styles/globals.css';
import '@/shared/styles/typography.css';
import '@/shared/styles/animations.css';
import '@/shared/styles/utilities.css';

// Theme tokens and theme files
import '@/core/theme/tokens/base.css';
import '@/core/theme/tokens/semantic.css';
import '@/core/theme/themes/blueEyes.light.css';
import '@/core/theme/themes/blueEyes.dark.css';
import '@/core/theme/themes/darkMagician.light.css';
import '@/core/theme/themes/darkMagician.dark.css';
import '@/core/theme/themes/exodia.light.css';
import '@/core/theme/themes/exodia.dark.css';

import App from '@/app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
