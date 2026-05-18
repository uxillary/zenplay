import { useEffect, useMemo, useState } from 'react'
import { SettingsPanel } from '../components/SettingsPanel'
import { SolitaireScreen } from '../games/solitaire/ui/SolitaireScreen'
import { loadSettings, saveSettings, type AppSettings } from '../lib/settings'

type Screen = 'home' | 'solitaire' | 'install'

export const App = () => {
  const [screen, setScreen] = useState<Screen>('home')
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const appClass = useMemo(() => {
    const classes = ['h-screen overflow-hidden p-2 md:p-6']
    classes.push(settings.theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-100 text-zinc-900')
    if (settings.highContrast) {
      classes.push(settings.theme === 'dark' ? 'contrast-125' : 'contrast-150')
    }
    return classes.join(' ')
  }, [settings])

  return (
    <main className={appClass}>
      <div className={`mx-auto grid h-full max-w-7xl grid-cols-1 gap-4 ${screen === 'solitaire' ? '' : 'lg:grid-cols-[1fr_360px]'}`}>
        <section className={`relative h-full overflow-hidden border p-2 md:p-4 ${screen === 'solitaire' ? 'rounded-lg border-emerald-950 bg-emerald-900' : 'rounded-3xl border-zinc-600/60 bg-zinc-900/50'}`}>
          {screen === 'home' ? (
            <div className="flex h-full flex-col justify-between gap-4">
              <h1 className="text-3xl font-semibold">ZenPlay</h1>
              <button
                type="button"
                onClick={() => setScreen('solitaire')}
                className="flex h-48 items-center justify-center rounded-3xl border border-zinc-500 bg-zinc-800 text-4xl font-semibold"
              >
                Solitaire
              </button>
              <button type="button" onClick={() => setScreen('install')} className="min-h-12 self-start rounded-xl bg-zinc-700 px-4 text-lg">
                Install ZenPlay
              </button>
            </div>
          ) : null}

          {screen === 'solitaire' ? (
            <>
              <button type="button" onClick={() => setScreen('home')} className="zen-game-button mb-3">
                Back
              </button>
              <SolitaireScreen settings={settings} />
            </>
          ) : null}

          {screen === 'install' ? (
            <div className="space-y-4 text-lg">
              <button type="button" onClick={() => setScreen('home')} className="min-h-12 rounded-xl bg-zinc-700 px-4 text-lg">
                Back
              </button>
              <h2 className="text-2xl font-semibold">Install ZenPlay</h2>
              <ol className="list-decimal space-y-2 pl-6">
                <li>Open ZenPlay in Chrome on Android.</li>
                <li>Tap the three dots menu.</li>
                <li>Tap “Add to Home screen”.</li>
                <li>Open ZenPlay from your new icon.</li>
              </ol>
            </div>
          ) : null}
        </section>

        {screen === 'solitaire' ? null : (
          <SettingsPanel
            settings={settings}
            onChange={(key, value) =>
              setSettings((current) => ({
                ...current,
                [key]: value,
              }))
            }
          />
        )}
      </div>
    </main>
  )
}
