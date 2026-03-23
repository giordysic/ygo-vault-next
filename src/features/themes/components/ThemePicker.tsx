import { themes, type ThemeId } from '@/core/theme/registry';
import { useTheme } from '@/app/providers/ThemeProvider';
import styles from './ThemePicker.module.css';

// Color swatches for each theme (approximate visual hints)
const THEME_SWATCHES: Record<string, string[]> = {
  'blue-eyes': ['#3b82f6', '#60a5fa', '#1e293b', '#f1f5f9'],
  'dark-magician': ['#8b5cf6', '#a78bfa', '#1e1b2e', '#f5f3ff'],
  'exodia': ['#f59e0b', '#fbbf24', '#1c1917', '#fefce8'],
};

export function ThemePicker() {
  const { themeId, themeMode, setTheme } = useTheme();

  return (
    <div className={styles.grid}>
      {themes.map((theme) => {
        const isActive = theme.id === themeId;
        const swatches = THEME_SWATCHES[theme.id] ?? [theme.accentColor];

        const cardClasses = [
          styles.card,
          isActive ? styles.cardActive : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div
            key={theme.id}
            className={cardClasses}
            onClick={() => setTheme(theme.id as ThemeId, themeMode)}
            role="button"
            tabIndex={0}
            aria-pressed={isActive}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setTheme(theme.id as ThemeId, themeMode);
              }
            }}
          >
            {isActive && (
              <span className={styles.checkMark} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
            )}
            <span className={styles.themeName}>{theme.name}</span>
            <span className={styles.themeDescription}>{theme.description}</span>
            <div className={styles.swatches}>
              {swatches.map((color, i) => (
                <span
                  key={i}
                  className={styles.swatch}
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
