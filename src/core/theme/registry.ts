// ==========================================================================
// Theme Registry
// Central registry for all available themes, metadata, and runtime switching.
// ==========================================================================

export type ThemeId = 'blue-eyes' | 'dark-magician' | 'exodia'
export type ThemeMode = 'light' | 'dark'

export interface ThemeMeta {
  id: ThemeId
  name: string
  description: string
  accentColor: string
}

export const themes: ThemeMeta[] = [
  {
    id: 'blue-eyes',
    name: 'Blue-Eyes White Dragon',
    description: 'Cool blue and silver palette inspired by the legendary dragon.',
    accentColor: '#3b82f6',
  },
  {
    id: 'dark-magician',
    name: 'Dark Magician',
    description: 'Mystical purple and violet tones channeling arcane power.',
    accentColor: '#8b5cf6',
  },
  {
    id: 'exodia',
    name: 'Exodia the Forbidden One',
    description: 'Rich gold and amber hues worthy of the Forbidden One.',
    accentColor: '#f59e0b',
  },
]

export const defaultThemeId: ThemeId = 'blue-eyes'
export const defaultThemeMode: ThemeMode = 'dark'

/**
 * Apply a theme by setting `data-theme` and `data-mode` attributes on the
 * document root element. The matching CSS selector (e.g.
 * `[data-theme="blue-eyes"][data-mode="dark"]`) will activate the
 * corresponding set of semantic token overrides.
 */
export function applyTheme(id: ThemeId, mode: ThemeMode): void {
  const root = document.documentElement
  root.setAttribute('data-theme', id)
  root.setAttribute('data-mode', mode)
}
