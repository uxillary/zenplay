import { useState } from 'react'
import { AccessibilityProvider } from './AccessibilityProvider'
import { useAccessibility } from './accessibilityContext'
import { games } from './gameRegistry'
import { GameCard } from '../components/GameCard'
import { GameShell } from '../components/GameShell'
import { SettingsPanel } from '../components/SettingsPanel'
import { SolitaireScreen } from '../games/solitaire/ui/SolitaireScreen'

type Screen = 'home' | 'game' | 'settings' | 'install'

const Application = () => {
  const [screen, setScreen] = useState<Screen>('home')
  const [gameId, setGameId] = useState<string | null>(null)
  const { settings, effectiveSettings, setSetting } = useAccessibility()

  const selectedGame = games.find((game) => game.id === gameId)

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f6f3e9] p-3 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 md:p-6">
      <div className="mx-auto min-h-[calc(100dvh-1.5rem)] max-w-7xl rounded-xl border border-emerald-950/20 bg-white/70 p-4 shadow-sm dark:bg-zinc-900/60 md:min-h-[calc(100dvh-3rem)] md:p-8">
        {screen === 'home' ? (
          <>
            <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-900 dark:text-emerald-200">ZenPlay</p>
                <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Choose a game</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setScreen('settings')} className="zen-game-button">Settings</button>
                <button type="button" onClick={() => setScreen('install')} className="zen-game-button">Install ZenPlay</button>
              </div>
            </header>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {games.filter((game) => game.status === 'available').map((game) => (
                <GameCard key={game.id} game={game} onSelect={() => { setGameId(game.id); setScreen('game') }} />
              ))}
            </div>
          </>
        ) : null}

        {screen === 'game' && selectedGame ? (
          <GameShell title={selectedGame.name} onBack={() => setScreen('home')}>
            {selectedGame.id === 'solitaire' ? <SolitaireScreen settings={effectiveSettings} /> : null}
          </GameShell>
        ) : null}

        {screen === 'settings' ? (
          <section className="mx-auto max-w-2xl space-y-4">
            <button type="button" onClick={() => setScreen('home')} className="zen-game-button">Back to games</button>
            <SettingsPanel settings={settings} onChange={setSetting} />
          </section>
        ) : null}

        {screen === 'install' ? (
          <section className="max-w-2xl space-y-4 text-lg">
            <button type="button" onClick={() => setScreen('home')} className="zen-game-button">Back to games</button>
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
