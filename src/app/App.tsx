import { useCallback, useEffect, useRef, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { AccessibilityProvider } from './AccessibilityProvider'
import { useAccessibility } from './accessibilityContext'
import { games } from './gameRegistry'
import { GameCard } from '../components/GameCard'
import { GameShell } from '../components/GameShell'
import { SettingsPanel } from '../components/SettingsPanel'
import { ProfilePanel } from '../components/ProfilePanel'
import { LocalDataPanel } from '../components/LocalDataPanel'
import { SupportZenPlayPanel } from '../components/SupporterExperience'
import { SolitaireScreen } from '../games/solitaire/ui/SolitaireScreen'
import { SudokuScreen } from '../games/sudoku/ui/SudokuScreen'
import { PairsScreen } from '../games/pairs/ui/PairsScreen'
import { WordSearchScreen } from '../games/wordSearch/ui/WordSearchScreen'
import { NoughtsCrossesScreen } from '../games/noughtsCrosses/ui/NoughtsCrossesScreen'
import { FifteenScreen } from '../games/fifteen/ui/FifteenScreen'
import { MahjongScreen } from '../games/mahjong/ui/MahjongScreen'
import { getInstallExperience, isStandaloneMode } from '../lib/pwa'
import { createAppHistoryState, readAppNavigation, type AppNavigation, type AppScreen } from './navigation'

const knownGameIds = new Set(games.map((game) => game.id))
const homeNavigation: AppNavigation = { screen: 'home', gameId: null }

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const detectStandaloneMode = () => isStandaloneMode(
  window.matchMedia('(display-mode: standalone)').matches,
  (navigator as Navigator & { standalone?: boolean }).standalone === true,
)

const detectIos = () => /iPhone|iPad|iPod/i.test(navigator.userAgent)
  || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1

const availableGames = games.filter((game) => game.status === 'available')

const Application = () => {
  const initialNavigation = readAppNavigation(window.history.state, knownGameIds) ?? homeNavigation
  const [navigation, setNavigation] = useState<AppNavigation>(initialNavigation)
  const { screen, gameId } = navigation
  const previousNavigation = useRef(navigation)
  const [continueAvailability, setContinueAvailability] = useState<Record<string, boolean>>({})
  const [standalone, setStandalone] = useState(detectStandaloneMode)
  const [installed, setInstalled] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [installMessage, setInstallMessage] = useState('')
  const [updateReady, setUpdateReady] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [saveWarning, setSaveWarning] = useState(false)
  const [saveRecoveryWarning, setSaveRecoveryWarning] = useState(false)
  const updateServiceWorker = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null)
  const { settings, effectiveSettings, setSetting, resetSettings } = useAccessibility()
  const ios = detectIos()
  const installExperience = getInstallExperience(standalone || installed, Boolean(installPrompt), ios)

  useEffect(() => {
    if (previousNavigation.current.screen === screen && previousNavigation.current.gameId === gameId) return
    previousNavigation.current = navigation
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-screen-heading]')?.focus())
  }, [gameId, navigation, screen])

  useEffect(() => {
    if (!readAppNavigation(window.history.state, knownGameIds)) {
      window.history.replaceState(createAppHistoryState(window.history.state, homeNavigation), '', window.location.href)
    }
    const onPopState = (event: PopStateEvent) => {
      const next = readAppNavigation(event.state, knownGameIds) ?? homeNavigation
      if (!readAppNavigation(event.state, knownGameIds)) {
        window.history.replaceState(createAppHistoryState(event.state, next), '', window.location.href)
      }
      setNavigation(next)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const updateSolitaireSaveAvailability = useCallback((hasSave: boolean) => {
    setContinueAvailability((current) => ({ ...current, solitaire: hasSave }))
  }, [])
  const updateSudokuSaveAvailability = useCallback((hasSave: boolean) => {
    setContinueAvailability((current) => ({ ...current, sudoku: hasSave }))
  }, [])
  const updatePairsSaveAvailability = useCallback((hasSave: boolean) => {
    setContinueAvailability((current) => ({ ...current, pairs: hasSave }))
  }, [])
  const updateWordSearchSaveAvailability = useCallback((hasSave: boolean) => {
    setContinueAvailability((current) => ({ ...current, 'word-search': hasSave }))
  }, [])
  const updateFifteenSaveAvailability = useCallback((hasSave: boolean) => {
    setContinueAvailability((current) => ({ ...current, fifteen: hasSave }))
  }, [])
  const updateMahjongSaveAvailability = useCallback((hasSave: boolean) => {
    setContinueAvailability((current) => ({ ...current, mahjong: hasSave }))
  }, [])
  const reportSaveFailure = useCallback(() => setSaveWarning(true), [])
  const reportSaveRecovery = useCallback(() => setSaveRecoveryWarning(true), [])

  const selectedGame = games.find((game) => game.id === gameId)
  const navigateTo = (nextScreen: AppScreen, nextGameId: string | null = null) => {
    const next = { screen: nextScreen, gameId: nextGameId }
    window.history.pushState(createAppHistoryState(window.history.state, next), '', window.location.href)
    setNavigation(next)
  }
  const returnHome = () => window.history.back()

  useEffect(() => {
    if (screen !== 'home' && screen !== 'settings') return
    let mounted = true
    void Promise.all(games.filter((game) => game.getContinueAvailability).map(async (game) => [game.id, await game.getContinueAvailability?.() ?? 'none'] as const))
      .then((availability) => {
        if (availability.some(([, status]) => status === 'rejected')) reportSaveRecovery()
        if (mounted) setContinueAvailability(Object.fromEntries(availability.map(([id, status]) => [id, status === 'available'])))
      })
    return () => { mounted = false }
  }, [reportSaveRecovery, screen])

  useEffect(() => {
    const displayMode = window.matchMedia('(display-mode: standalone)')
    const syncStandalone = () => setStandalone(isStandaloneMode(displayMode.matches, (navigator as Navigator & { standalone?: boolean }).standalone === true))
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
      setInstallMessage('ZenPlay is installed. You can keep playing here.')
    }
    displayMode.addEventListener('change', syncStandalone)
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    try {
      updateServiceWorker.current = registerSW({
        immediate: true,
        onNeedRefresh: () => setUpdateReady(true),
        onOfflineReady: () => setOfflineReady(true),
      })
    } catch {
      // The app remains usable in the browser when service-worker registration is unavailable.
    }
    return () => {
      displayMode.removeEventListener('change', syncStandalone)
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      updateServiceWorker.current = null
    }
  }, [])

  const installZenPlay = async () => {
    if (!installPrompt) return
    try {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      setInstallPrompt(null)
      if (choice.outcome === 'accepted') {
        setInstalled(true)
        setInstallMessage('ZenPlay is installed. You can keep playing here.')
      } else setInstallMessage('No problem. You can keep playing in this tab.')
    } catch {
      setInstallPrompt(null)
      setInstallMessage('The install prompt is unavailable right now. You can keep playing in this tab.')
    }
  }

  return (
    <main className="zen-app-frame min-h-[100dvh] overflow-x-hidden p-3 md:p-6">
      <div className="zen-app-panel mx-auto min-h-[calc(100dvh-1.5rem)] max-w-7xl p-4 md:min-h-[calc(100dvh-3rem)] md:p-8">
        {updateReady && screen !== 'game' ? <div className="zen-pwa-notice" role="region" aria-label="ZenPlay update">
          <span role="status" aria-live="polite">A ZenPlay update is ready.</span>
          <button type="button" onClick={() => void updateServiceWorker.current?.(true)} className="zen-game-button zen-game-button--small">Update now</button>
          <button type="button" onClick={() => setUpdateReady(false)} className="zen-game-button zen-game-button--small">Later</button>
        </div> : offlineReady && screen !== 'game' ? <div className="zen-pwa-notice" role="region" aria-label="Offline availability">
          <span role="status" aria-live="polite">ZenPlay is ready to play offline.</span>
          <button type="button" onClick={() => setOfflineReady(false)} className="zen-game-button zen-game-button--small">Dismiss</button>
        </div> : null}
        {saveRecoveryWarning ? <p role="alert" className="my-3 rounded-lg border border-amber-700 p-3 text-base">
          A saved game couldn’t be restored. You can start a new game. <button type="button" className="underline" onClick={() => setSaveRecoveryWarning(false)}>Dismiss</button>
        </p> : null}
        {screen === 'home' ? (
          <>
            <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="zen-wordmark">ZenPlay</p>
                <h1 data-screen-heading tabIndex={-1} className="zen-home-title mt-2">Choose a game</h1>
                <p className="mt-2 text-lg">Classic games. Easy to see. Easy to understand. No adverts. No online account needed.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => navigateTo('profile')} className="zen-game-button">Profile</button>
                <button type="button" onClick={() => navigateTo('settings')} className="zen-game-button">Settings</button>
                {installExperience !== 'installed' ? <button type="button" onClick={() => navigateTo('install')} className="zen-game-button">Install ZenPlay</button> : null}
              </div>
            </header>
            <div className="zen-game-library grid grid-cols-1 gap-4 sm:grid-cols-2">
              {availableGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  canContinue={continueAvailability[game.id] ?? false}
                  onSelect={() => { setSaveWarning(false); navigateTo('game', game.id) }}
                  onContinue={() => { setSaveWarning(false); navigateTo('game', game.id) }}
                />
              ))}
            </div>
          </>
        ) : null}

        {screen === 'game' && selectedGame ? (
          <GameShell title={selectedGame.name} onBack={returnHome}>
            {saveWarning ? <p role="alert" className="my-3 rounded-lg border border-amber-700 p-3 text-base">Your progress could not be saved on this device. Keep this page open to avoid losing it. <button type="button" className="underline" onClick={() => setSaveWarning(false)}>Dismiss</button></p> : null}
            {selectedGame.id === 'solitaire' ? <SolitaireScreen settings={effectiveSettings} onBack={returnHome} onSaveAvailabilityChange={updateSolitaireSaveAvailability} onSaveFailure={reportSaveFailure} onSaveRecovery={reportSaveRecovery} /> : null}
            {selectedGame.id === 'sudoku' ? <SudokuScreen settings={effectiveSettings} onBack={returnHome} onSaveAvailabilityChange={updateSudokuSaveAvailability} onSaveFailure={reportSaveFailure} onSaveRecovery={reportSaveRecovery} /> : null}
            {selectedGame.id === 'pairs' ? <PairsScreen settings={effectiveSettings} onBack={returnHome} onSaveAvailabilityChange={updatePairsSaveAvailability} onSaveFailure={reportSaveFailure} onSaveRecovery={reportSaveRecovery} /> : null}
            {selectedGame.id === 'word-search' ? <WordSearchScreen settings={effectiveSettings} onBack={returnHome} onSaveAvailabilityChange={updateWordSearchSaveAvailability} onSaveFailure={reportSaveFailure} onSaveRecovery={reportSaveRecovery} /> : null}
            {selectedGame.id === 'noughts-crosses' ? <NoughtsCrossesScreen settings={effectiveSettings} onBack={returnHome} /> : null}
            {selectedGame.id === 'fifteen' ? <FifteenScreen settings={effectiveSettings} onBack={returnHome} onSaveAvailabilityChange={updateFifteenSaveAvailability} onSaveFailure={reportSaveFailure} onSaveRecovery={reportSaveRecovery} /> : null}
            {selectedGame.id === 'mahjong' ? <MahjongScreen settings={effectiveSettings} onSaveAvailabilityChange={updateMahjongSaveAvailability} onSaveFailure={reportSaveFailure} onSaveRecovery={reportSaveRecovery} /> : null}
          </GameShell>
        ) : null}

        {screen === 'settings' ? (
          <section className="mx-auto max-w-2xl space-y-4">
            <button type="button" onClick={returnHome} className="zen-game-button zen-game-button--back">Back to Games</button>
            <SettingsPanel settings={settings} onChange={setSetting} />
            <LocalDataPanel
              onSavedGamesCleared={() => {
                setContinueAvailability((current) => ({
                  ...current,
                  ...Object.fromEntries(games.filter((game) => game.getContinueAvailability).map((game) => [game.id, false])),
                }))
                setSaveRecoveryWarning(false)
              }}
              onPreferencesReset={resetSettings}
            />
          </section>
        ) : null}

        {screen === 'profile' ? (
          <section className="mx-auto max-w-2xl space-y-4">
            <button type="button" onClick={returnHome} className="zen-game-button zen-game-button--back">Back to Games</button>
            <ProfilePanel games={availableGames} onOpenSupport={() => navigateTo('support')} />
          </section>
        ) : null}

        {screen === 'support' ? (
          <SupportZenPlayPanel onBack={() => window.history.back()} />
        ) : null}

        {screen === 'install' ? (
          <section className="mx-auto max-w-2xl space-y-4 text-lg" aria-labelledby="install-title">
            <button type="button" onClick={returnHome} className="zen-game-button zen-game-button--back">Back to Games</button>
            <h1 id="install-title" data-screen-heading tabIndex={-1} className="text-2xl font-semibold">Install ZenPlay</h1>
            <p>Keep ZenPlay with your other apps and play offline after it has loaded once.</p>
            {installExperience === 'installed' ? <p role="status">ZenPlay is already installed and ready to use.</p> : null}
            {installExperience === 'prompt' ? <button type="button" onClick={() => void installZenPlay()} className="zen-game-button zen-game-button--primary">Install ZenPlay</button> : null}
            {installExperience === 'ios-manual' ? <p>In Safari, tap Share, then choose “Add to Home Screen”.</p> : null}
            {installExperience === 'browser-manual' ? <p>If your browser offers installation, look for “Install ZenPlay” in its menu. Otherwise, you can keep playing in this tab.</p> : null}
            {installMessage && installExperience !== 'installed' ? <p role="status" aria-live="polite">{installMessage}</p> : null}
          </section>
        ) : null}
      </div>
    </main>
  )
}

export const App = () => <AccessibilityProvider><Application /></AccessibilityProvider>
