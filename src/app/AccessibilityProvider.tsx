import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { getEffectiveSettings, loadSettings, resolveTheme, saveSettings, type AppSettings } from '../lib/settings'
import { AccessibilityContext, type AccessibilityContextValue } from './accessibilityContext'

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())
  const [systemDark, setSystemDark] = useState(false)
  const [systemReducedMotion, setSystemReducedMotion] = useState(false)
  const effectiveSettings = useMemo(
    () => getEffectiveSettings(settings, systemReducedMotion),
    [settings, systemReducedMotion],
  )

  useEffect(() => saveSettings(settings), [settings])

  useEffect(() => {
    const dark = window.matchMedia('(prefers-color-scheme: dark)')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateDark = () => setSystemDark(dark.matches)
    const updateMotion = () => setSystemReducedMotion(motion.matches)
    updateDark()
    updateMotion()
    dark.addEventListener('change', updateDark)
    motion.addEventListener('change', updateMotion)
    return () => {
      dark.removeEventListener('change', updateDark)
      motion.removeEventListener('change', updateMotion)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const darkMode = resolveTheme(settings.theme, systemDark) === 'dark'
    root.classList.toggle('dark', darkMode)
    root.classList.toggle('high-contrast', effectiveSettings.highContrast)
    root.classList.toggle('simple-mode', settings.simpleMode)
    root.classList.toggle('reduced-motion', effectiveSettings.reducedMotion)
    root.style.setProperty('--zen-ui-scale', effectiveSettings.uiScale === 'extra-large' ? '1.25' : effectiveSettings.uiScale === 'large' ? '1.125' : '1')
    root.style.colorScheme = darkMode ? 'dark' : 'light'
  }, [effectiveSettings, settings.simpleMode, settings.theme, systemDark])

  const value = useMemo<AccessibilityContextValue>(() => ({
    settings,
    effectiveSettings,
    setSetting: (key, value) => setSettings((current) => ({ ...current, [key]: value })),
  }), [settings, effectiveSettings])

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
}
