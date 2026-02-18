export type ThemeMode = 'light' | 'dark'
export type Handedness = 'left' | 'right'

export type AppSettings = {
  theme: ThemeMode
  highContrast: boolean
  largeCards: boolean
  reducedMotion: boolean
  handedness: Handedness
}

const STORAGE_KEY = 'zenplay-settings'

export const defaultSettings: AppSettings = {
  theme: 'dark',
  highContrast: false,
  largeCards: false,
  reducedMotion: false,
  handedness: 'right',
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
