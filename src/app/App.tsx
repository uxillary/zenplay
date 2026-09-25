import { useCallback, useEffect, useState } from 'react'
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

type Screen = 'home' | 'game' | 'settings' | 'install'

const Application = () => {
  const [screen, setScreen] = useState<Screen>('home')
  const [gameId, setGameId] = useState<string | null>(null)
  const [continueAvailability, setContinueAvailability] = useState<Record<string, boolean>>({})
  const { settings, effectiveSettings, setSetting } = useAccessibility()

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
                <button type="button" onClick={() => setScreen('install')} className="zen-game-button">Install ZenPlay</button>
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
          <section className="max-w-2xl space-y-4 text-lg">
            <button type="button" onClick={() => setScreen('home')} className="zen-game-button zen-game-button--back">Back to Games</button>
            <h1 className="text-2xl font-semibold">Install ZenPlay</h1>
            <ol className="list-decimal space-y-2 pl-6">
              <li>Open ZenPlay in Chrome on Android.</li><li>Tap the three dots menu.</li><li>Tap “Add to Home screen”.</li><li>Open ZenPlay from your new icon.</li>
            </ol>
          </section>
        ) : null}
      </div>
    </main>
  )
}

export const App = () => <AccessibilityProvider><Application /></AccessibilityProvider>
