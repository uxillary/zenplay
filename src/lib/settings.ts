export type ThemeMode = 'light' | 'dark'
export type Handedness = 'left' | 'right'
export type DrawMode = 'one' | 'three'

export type AppSettings = {
  theme: ThemeMode
  highContrast: boolean
  largeCards: boolean
  reducedMotion: boolean
  handedness: Handedness
  calmStats: boolean
  timer: boolean
  drawMode: DrawMode
}

const STORAGE_KEY = 'zenplay-settings'

export const defaultSettings: AppSettings = {
  theme: 'dark',
  highContrast: false,
  largeCards: false,
  reducedMotion: false,
  handedness: 'right',
  calmStats: false,
  timer: true,
  drawMode: 'one',
}

export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return { ...defaultSettings, ...parsed }
  } catch {
    return defaultSettings
  }
}

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
