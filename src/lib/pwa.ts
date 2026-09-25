export type InstallExperience = 'installed' | 'prompt' | 'ios-manual' | 'browser-manual'

export const isStandaloneMode = (displayModeStandalone: boolean, iosStandalone: boolean): boolean =>
  displayModeStandalone || iosStandalone

export const getInstallExperience = (installed: boolean, promptAvailable: boolean, ios: boolean): InstallExperience => {
  if (installed) return 'installed'
  if (promptAvailable) return 'prompt'
  return ios ? 'ios-manual' : 'browser-manual'
}
