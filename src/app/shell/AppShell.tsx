// ==========================================================================
// App Shell
// Main layout wrapper: header, sidebar (desktop), content area, bottom nav.
// ==========================================================================

import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { GlobalOverlays } from './GlobalOverlays';
import styles from './AppShell.module.css';

export function AppShell() {
  return (
    <div className={styles.shell}>
      <AppHeader />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <GlobalOverlays />
    </div>
  );
}
