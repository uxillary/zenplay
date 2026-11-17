export type AppScreen = 'home' | 'game' | 'settings' | 'profile' | 'support' | 'install' | 'not-found'

export type AppNavigation = {
  screen: AppScreen
  gameId: string | null
}

const NAVIGATION_KEY = 'zenplayNavigation'
const NAVIGATION_VERSION_KEY = 'zenplayNavigationVersion'
export const homeNavigation: AppNavigation = { screen: 'home', gameId: null }
export const solitaireNavigation: AppNavigation = { screen: 'game', gameId: 'solitaire' }
export const notFoundNavigation: AppNavigation = { screen: 'not-found', gameId: null }

// Only Home and Solitaire are public routes in M20B.1. Other screens stay in
// root history entries until their static documents are implemented.
export const parseAppPath = (pathname: string): AppNavigation | null => {
  if (pathname === '/' || pathname === '/index.html') return homeNavigation
  if (pathname === '/games/solitaire/' || pathname === '/games/solitaire' || pathname === '/games/solitaire/index.html') return solitaireNavigation
  return null
}

export const appPathForNavigation = (navigation: AppNavigation): '/' | '/games/solitaire/' =>
  navigation.screen === 'game' && navigation.gameId === 'solitaire' ? '/games/solitaire/' : '/'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const readAppNavigation = (
  historyState: unknown,
  knownGameIds: ReadonlySet<string>,
): AppNavigation | null => {
  if (!isRecord(historyState) || !isRecord(historyState[NAVIGATION_KEY])) return null
  const navigation = historyState[NAVIGATION_KEY]
  if (navigation.screen === 'home'
    || navigation.screen === 'settings'
    || navigation.screen === 'profile'
    || navigation.screen === 'support'
    || navigation.screen === 'install') {
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
  [NAVIGATION_VERSION_KEY]: 1,
})

export const resolveAppNavigation = (pathname: string, historyState: unknown, knownGameIds: ReadonlySet<string>): AppNavigation => {
  const route = parseAppPath(pathname)
  if (!route) return notFoundNavigation
  if (route.screen === 'game') return route
  const saved = readAppNavigation(historyState, knownGameIds)
  if (!saved) return homeNavigation
  const legacy = isRecord(historyState) && !(NAVIGATION_VERSION_KEY in historyState)
  // Explicit new Home entries cannot be hijacked by stale Solitaire state.
  if (saved.screen === 'game' && saved.gameId === 'solitaire') return legacy ? saved : homeNavigation
  return saved
}

export const shouldHandleLinkClick = (event: {
  defaultPrevented: boolean
  button: number
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
}): boolean => !event.defaultPrevented && event.button === 0
  && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
