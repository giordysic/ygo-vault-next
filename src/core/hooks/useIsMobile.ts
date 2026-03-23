import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../constants/theme';

/**
 * Detect if the viewport is at or below the mobile breakpoint (768px).
 * Uses matchMedia for efficient, event-driven detection.
 */
export function useIsMobile(breakpoint: number = BREAKPOINTS.mobile): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Set initial value from the media query
    setIsMobile(mql.matches);

    mql.addEventListener('change', handleChange);
    return () => {
      mql.removeEventListener('change', handleChange);
    };
  }, [breakpoint]);

  return isMobile;
}
