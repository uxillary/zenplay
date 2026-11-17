import { gameCatalogue } from './gameCatalogue.ts'

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

export const utilityRoutes = [
  { screen: 'settings', path: '/settings/', heading: 'Settings', description: 'Choose text size, contrast, motion and game preferences on this device.' },
  { screen: 'profile', path: '/profile/', heading: 'Profile', description: 'Manage your private local profile and optional online account. An account is never required to play.' },
  { screen: 'support', path: '/support/', heading: 'Support ZenPlay', description: 'Explore the clearly labelled support prototype. No payments or purchases are available.' },
  { screen: 'install', path: '/install/', heading: 'Install ZenPlay', description: 'Find installation guidance for ZenPlay and play offline after its offline copy is ready.' },
] as const

export const pageRoutes: readonly { path: string; navigation: AppNavigation }[] = [
  { path: '/', navigation: homeNavigation },
  ...gameCatalogue.map((game) => ({ path: game.target, navigation: { screen: 'game' as const, gameId: game.id } })),
  ...utilityRoutes.map(({ path, screen }) => ({ path, navigation: { screen, gameId: null } })),
]

export const canonicalPathForRequest = (pathname: string): string | null => pageRoutes.find(({ path }) =>
  pathname === path || pathname === `${path}index.html` || path !== '/' && pathname === path.slice(0, -1))?.path ?? null

export const parseAppPath = (pathname: string): AppNavigation | null => {
  const canonical = canonicalPathForRequest(pathname)
  return pageRoutes.find(({ path }) => path === canonical)?.navigation ?? null
}

export const appPathForNavigation = (navigation: AppNavigation): string => {
  const route = pageRoutes.find((entry) => entry.navigation.screen === navigation.screen && entry.navigation.gameId === navigation.gameId)
  if (!route) throw new Error('Unknown ZenPlay navigation')
  return route.path
}

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
  [NAVIGATION_VERSION_KEY]: 2,
})

export const resolveAppNavigation = (pathname: string, historyState: unknown, knownGameIds: ReadonlySet<string>): AppNavigation => {
  const route = parseAppPath(pathname)
  if (!route) return notFoundNavigation
  if (route.screen !== 'home') return route
  const saved = readAppNavigation(historyState, knownGameIds)
  if (!saved || !isRecord(historyState)) return homeNavigation
  const legacy = !(NAVIGATION_VERSION_KEY in historyState)
  // M20B.1 kept non-Solitaire screens in version-1 root entries. Upgrade those
  // too, while retaining its protection against stale Solitaire/Home entries.
  const partialCatalogue = historyState[NAVIGATION_VERSION_KEY] === 1
    && !(saved.screen === 'game' && saved.gameId === 'solitaire')
  return legacy || partialCatalogue ? saved : homeNavigation
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
