export const THEME_IDS = {
  BLUE_EYES: 'blue-eyes',
  DARK_MAGICIAN: 'dark-magician',
  EXODIA: 'exodia',
} as const;

export type ThemeId = (typeof THEME_IDS)[keyof typeof THEME_IDS];

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type ThemeMode = (typeof THEME_MODES)[keyof typeof THEME_MODES];

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  mode: ThemeMode;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  id: THEME_IDS.BLUE_EYES,
  label: 'Blue-Eyes',
  mode: THEME_MODES.DARK,
};

export const AVAILABLE_THEMES: readonly ThemeConfig[] = [
  { id: THEME_IDS.BLUE_EYES, label: 'Blue-Eyes', mode: THEME_MODES.DARK },
  { id: THEME_IDS.DARK_MAGICIAN, label: 'Dark Magician', mode: THEME_MODES.DARK },
  { id: THEME_IDS.EXODIA, label: 'Exodia', mode: THEME_MODES.DARK },
] as const;

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;
