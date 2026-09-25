import { useCallback, useEffect, useRef, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { AccessibilityProvider } from './AccessibilityProvider'
import { useAccessibility } from './accessibilityContext'
import { games } from './gameRegistry'
import { GameCard } from '../components/GameCard'
import { GameShell } from '../components/GameShell'
import { SettingsPanel } from '../components/SettingsPanel'
import { SavedGamePanel } from '../components/SavedGamePanel'
import { SolitaireScreen } from '../games/solitaire/ui/SolitaireScreen'
import { SudokuScreen } from '../games/sudoku/ui/SudokuScreen'
import { PairsScreen } from '../games/pairs/ui/PairsScreen'
import { WordSearchScreen } from '../games/wordSearch/ui/WordSearchScreen'
import { NoughtsCrossesScreen } from '../games/noughtsCrosses/ui/NoughtsCrossesScreen'
import { FifteenScreen } from '../games/fifteen/ui/FifteenScreen'
import { getInstallExperience, isStandaloneMode } from '../lib/pwa'

type Screen = 'home' | 'game' | 'settings' | 'install'
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

const Application = () => {
  const [screen, setScreen] = useState<Screen>('home')
  const [gameId, setGameId] = useState<string | null>(null)
  const [continueAvailability, setContinueAvailability] = useState<Record<string, boolean>>({})
  const [standalone, setStandalone] = useState(detectStandaloneMode)
  const [installed, setInstalled] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [installMessage, setInstallMessage] = useState('')
  const [updateReady, setUpdateReady] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const updateServiceWorker = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null)
  const { settings, effectiveSettings, setSetting } = useAccessibility()
  const ios = detectIos()
  const installExperience = getInstallExperience(standalone || installed, Boolean(installPrompt), ios)

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

  const selectedGame = games.find((game) => game.id === gameId)
  const returnHome = () => setScreen('home')

  useEffect(() => {
    if (screen !== 'home' && screen !== 'settings') return
    let mounted = true
    void Promise.all(games.filter((game) => game.getContinueAvailability).map(async (game) => [game.id, await game.getContinueAvailability?.() ?? false] as const))
      .then((availability) => {
        if (mounted) setContinueAvailability(Object.fromEntries(availability))
      })
    return () => { mounted = false }
  }, [screen])

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
        {screen === 'home' ? (
          <>
            <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="zen-wordmark">ZenPlay</p>
                <h1 className="zen-home-title mt-2">Choose a game</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setScreen('settings')} className="zen-game-button">Settings</button>
                {installExperience !== 'installed' ? <button type="button" onClick={() => setScreen('install')} className="zen-game-button">Install ZenPlay</button> : null}
              </div>
            </header>
            <div className="zen-game-library grid grid-cols-1 gap-4 sm:grid-cols-2">
              {games.filter((game) => game.status === 'available').map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  canContinue={continueAvailability[game.id] ?? false}
                  onSelect={() => { setGameId(game.id); setScreen('game') }}
                  onContinue={() => { setGameId(game.id); setScreen('game') }}
                />
              ))}
            </div>
          </>
        ) : null}

        {screen === 'game' && selectedGame ? (
          <GameShell title={selectedGame.name} onBack={returnHome}>
            {selectedGame.id === 'solitaire' ? <SolitaireScreen settings={effectiveSettings} onBack={returnHome} onSaveAvailabilityChange={updateSolitaireSaveAvailability} /> : null}
            {selectedGame.id === 'sudoku' ? <SudokuScreen settings={effectiveSettings} onBack={returnHome} onSaveAvailabilityChange={updateSudokuSaveAvailability} /> : null}
            {selectedGame.id === 'pairs' ? <PairsScreen settings={effectiveSettings} onBack={returnHome} onSaveAvailabilityChange={updatePairsSaveAvailability} /> : null}
            {selectedGame.id === 'word-search' ? <WordSearchScreen settings={effectiveSettings} onBack={returnHome} onSaveAvailabilityChange={updateWordSearchSaveAvailability} /> : null}
            {selectedGame.id === 'noughts-crosses' ? <NoughtsCrossesScreen settings={effectiveSettings} onBack={returnHome} /> : null}
            {selectedGame.id === 'fifteen' ? <FifteenScreen settings={effectiveSettings} onBack={returnHome} onSaveAvailabilityChange={updateFifteenSaveAvailability} /> : null}
          </GameShell>
        ) : null}

        {screen === 'settings' ? (
          <section className="mx-auto max-w-2xl space-y-4">
            <button type="button" onClick={() => setScreen('home')} className="zen-game-button zen-game-button--back">Back to Games</button>
            <SettingsPanel settings={settings} onChange={setSetting} />
            <SavedGamePanel hasSave={continueAvailability.solitaire ?? false} onSaveCleared={() => setContinueAvailability((current) => ({ ...current, solitaire: false }))} />
          </section>
        ) : null}

        {screen === 'install' ? (
          <section className="mx-auto max-w-2xl space-y-4 text-lg" aria-labelledby="install-title">
            <button type="button" onClick={() => setScreen('home')} className="zen-game-button zen-game-button--back">Back to Games</button>
            <h1 id="install-title" className="text-2xl font-semibold">Install ZenPlay</h1>
            <p>Keep ZenPlay with your other apps and play offline after it has loaded once.</p>
            {installExperience === 'installed' ? <p role="status">ZenPlay is already installed and ready to use.</p> : null}
            {installExperience === 'prompt' ? <button type="button" onClick={() => void installZenPlay()} className="zen-game-button zen-game-button--primary">Install ZenPlay</button> : null}
            {installExperience === 'ios-manual' ? <p>In Safari, tap Share, then choose “Add to Home Screen”.</p> : null}
            {installExperience === 'browser-manual' ? <p>If your browser offers installation, look for “Install ZenPlay” in its menu. Otherwise, you can keep playing in this tab.</p> : null}
            {installMessage && installExperience !== 'installed' ? <p role="status" aria-live="polite">{installMessage}</p> : null}
          </section>
        ) : null}
      </div>
      {updateReady ? <div className="zen-pwa-notice" role="region" aria-label="ZenPlay update">
        <span role="status" aria-live="polite">A ZenPlay update is ready.</span>
        <button type="button" onClick={() => void updateServiceWorker.current?.(true)} className="zen-game-button zen-game-button--small">Update now</button>
        <button type="button" onClick={() => setUpdateReady(false)} className="zen-game-button zen-game-button--small">Later</button>
      </div> : offlineReady ? <div className="zen-pwa-notice" role="region" aria-label="Offline availability">
        <span role="status" aria-live="polite">ZenPlay is ready to play offline.</span>
        <button type="button" onClick={() => setOfflineReady(false)} className="zen-game-button zen-game-button--small">Dismiss</button>
      </div> : null}
    </main>
  )
}

export const App = () => <AccessibilityProvider><Application /></AccessibilityProvider>
