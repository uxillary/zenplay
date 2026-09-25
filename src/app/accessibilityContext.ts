import { createContext, useContext } from 'react'
import type { AppSettings } from '../lib/settings'

export type AccessibilityContextValue = {
  settings: AppSettings
  effectiveSettings: AppSettings
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
}

export const AccessibilityContext = createContext<AccessibilityContextValue | null>(null)

export const useAccessibility = (): AccessibilityContextValue => {
  const value = useContext(AccessibilityContext)
  if (!value) throw new Error('useAccessibility must be used inside AccessibilityProvider')
  return value
}
