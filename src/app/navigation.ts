export type AppScreen = 'home' | 'game' | 'settings' | 'install'

export type AppNavigation = {
  screen: AppScreen
  gameId: string | null
}

const NAVIGATION_KEY = 'zenplayNavigation'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const readAppNavigation = (
  historyState: unknown,
  knownGameIds: ReadonlySet<string>,
): AppNavigation | null => {
  if (!isRecord(historyState) || !isRecord(historyState[NAVIGATION_KEY])) return null
  const navigation = historyState[NAVIGATION_KEY]
  if (navigation.screen === 'home' || navigation.screen === 'settings' || navigation.screen === 'install') {
    return { screen: navigation.screen, gameId: null }
  }
  if (navigation.screen === 'game' && typeof navigation.gameId === 'string' && knownGameIds.has(navigation.gameId)) {
    return { screen: 'game', gameId: navigation.gameId }
  }
  return null
}

export const createAppHistoryState = (historyState: unknown, navigation: AppNavigation): Record<string, unknown> => ({
  ...(isRecord(historyState) ? historyState : {}),
  [NAVIGATION_KEY]: navigation,
})
