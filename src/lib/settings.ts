export type ThemeMode = 'light' | 'dark' | 'system'
export type Handedness = 'left' | 'right'
export type DrawMode = 'one' | 'three'
export type UiScale = 'normal' | 'large' | 'extra-large'
export type GamePieceScale = 'normal' | 'large'

export type AppSettings = {
  theme: ThemeMode
  uiScale: UiScale
  gamePieceScale: GamePieceScale
  highContrast: boolean
  reducedMotion: boolean
  simpleMode: boolean
  handedness: Handedness
  calmStats: boolean
  timer: boolean
  drawMode: DrawMode
}

export const SETTINGS_VERSION = 2
const STORAGE_KEY = 'zenplay-settings'

export const defaultSettings: AppSettings = {
  theme: 'dark',
  uiScale: 'normal',
  gamePieceScale: 'normal',
  highContrast: false,
  reducedMotion: false,
  simpleMode: false,
  handedness: 'right',
  calmStats: false,
  timer: true,
  drawMode: 'one',
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const oneOf = <T extends string>(value: unknown, values: readonly T[], fallback: T): T =>
  values.includes(value as T) ? value as T : fallback

export const parseSettings = (raw: string | null): AppSettings => {
  if (!raw) return { ...defaultSettings }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return { ...defaultSettings }
    const values = isRecord(parsed.settings) ? parsed.settings : parsed
    const migratedTheme = values.theme === 'system' ? 'system' : values.theme
    return {
      ...defaultSettings,
      theme: oneOf(migratedTheme, ['light', 'dark', 'system'] as const, defaultSettings.theme),
      uiScale: oneOf(values.uiScale, ['normal', 'large', 'extra-large'] as const, defaultSettings.uiScale),
      gamePieceScale: oneOf(
        values.gamePieceScale,
        ['normal', 'large'] as const,
        values.largeCards === true ? 'large' : defaultSettings.gamePieceScale,
      ),
      highContrast: typeof values.highContrast === 'boolean' ? values.highContrast : defaultSettings.highContrast,
      reducedMotion: typeof values.reducedMotion === 'boolean' ? values.reducedMotion : defaultSettings.reducedMotion,
      simpleMode: typeof values.simpleMode === 'boolean' ? values.simpleMode : defaultSettings.simpleMode,
      handedness: oneOf(values.handedness, ['left', 'right'] as const, defaultSettings.handedness),
      calmStats: typeof values.calmStats === 'boolean' ? values.calmStats : defaultSettings.calmStats,
      timer: typeof values.timer === 'boolean' ? values.timer : defaultSettings.timer,
      drawMode: oneOf(values.drawMode, ['one', 'three'] as const, defaultSettings.drawMode),
    }
  } catch {
    return { ...defaultSettings }
  }
}

export const serializeSettings = (settings: AppSettings): string =>
  JSON.stringify({ version: SETTINGS_VERSION, settings })

export const resolveTheme = (theme: ThemeMode, systemDark: boolean): 'light' | 'dark' =>
  theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

export const getEffectiveSettings = (
  settings: AppSettings,
  systemReducedMotion = false,
): AppSettings => settings.simpleMode
  ? { ...settings, uiScale: 'extra-large', gamePieceScale: 'large', highContrast: true, reducedMotion: true }
  : { ...settings, reducedMotion: settings.reducedMotion || systemReducedMotion }

export const loadSettings = (): AppSettings => {
  try {
    return parseSettings(localStorage.getItem(STORAGE_KEY))
  } catch {
    return { ...defaultSettings }
  }
}

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, serializeSettings(settings))
  } catch {
    // Keep the app usable when browser storage is unavailable.
  }
}
