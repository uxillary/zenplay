export type ThemeMode = 'light' | 'dark' | 'system'
export type Handedness = 'left' | 'right'
export type DrawMode = 'one' | 'three'
export type UiScale = 'normal' | 'large' | 'extra-large'
export type GamePieceScale = 'normal' | 'large'
export type SolitaireTableTheme = 'classic-green' | 'midnight-blue' | 'burgundy'
export type SolitaireCardStyle = 'classic' | 'large-print'
export type SolitaireCardFaces = 'simplified' | 'traditional'
export type SolitaireCardBack = 'classic-blue' | 'traditional-red' | 'high-contrast'

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
  solitaireTableTheme: SolitaireTableTheme
  solitaireCardStyle: SolitaireCardStyle
  solitaireCardFaces: SolitaireCardFaces
  solitaireCardBack: SolitaireCardBack
  solitaireVerboseFeedback: boolean
  solitaireShowPossibleMoves: boolean
}

export const SETTINGS_VERSION = 5
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
  solitaireTableTheme: 'classic-green',
  solitaireCardStyle: 'classic',
  solitaireCardFaces: 'simplified',
  solitaireCardBack: 'classic-blue',
  solitaireVerboseFeedback: false,
  solitaireShowPossibleMoves: false,
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
      solitaireTableTheme: oneOf(values.solitaireTableTheme, ['classic-green', 'midnight-blue', 'burgundy'] as const, defaultSettings.solitaireTableTheme),
      solitaireCardStyle: oneOf(values.solitaireCardStyle, ['classic', 'large-print'] as const, defaultSettings.solitaireCardStyle),
      solitaireCardFaces: oneOf(values.solitaireCardFaces, ['simplified', 'traditional'] as const, defaultSettings.solitaireCardFaces),
      solitaireCardBack: oneOf(values.solitaireCardBack, ['classic-blue', 'traditional-red', 'high-contrast'] as const, defaultSettings.solitaireCardBack),
      solitaireVerboseFeedback: typeof values.solitaireVerboseFeedback === 'boolean' ? values.solitaireVerboseFeedback : defaultSettings.solitaireVerboseFeedback,
      solitaireShowPossibleMoves: typeof values.solitaireShowPossibleMoves === 'boolean' ? values.solitaireShowPossibleMoves : defaultSettings.solitaireShowPossibleMoves,
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
  ? { ...settings, uiScale: 'extra-large', gamePieceScale: 'large', highContrast: true, reducedMotion: true, calmStats: true }
  : { ...settings, reducedMotion: settings.reducedMotion || systemReducedMotion }

export const loadSettings = (storage: Pick<Storage, 'getItem'> = localStorage): AppSettings => {
  try {
    return parseSettings(storage.getItem(STORAGE_KEY))
  } catch {
    return { ...defaultSettings }
  }
}

export const saveSettings = (settings: AppSettings, storage: Pick<Storage, 'setItem'> = localStorage): boolean => {
  try {
    storage.setItem(STORAGE_KEY, serializeSettings(settings))
    return true
  } catch {
    // Keep the app usable when browser storage is unavailable.
    return false
  }
}

export const resetStoredSettings = (storage: Pick<Storage, 'setItem'> = localStorage): boolean =>
  saveSettings(defaultSettings, storage)
