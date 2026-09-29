import { useState } from 'react'
import { clearAllActiveSaves } from '../persistence/gameSave'
import { clearAllStatistics } from '../persistence/statistics'
import { GameDialog } from './GameDialog'

type Action = 'saves' | 'statistics' | 'preferences'

type Props = {
  onSavedGamesCleared: () => void
  onPreferencesReset: () => boolean
}

const actionContent: Record<Action, { title: string; description: string; confirm: string; success: string; failure: string }> = {
  saves: {
    title: 'Clear saved games?',
    description: 'Your resumable games will be removed. Statistics and settings will stay.',
    confirm: 'Clear saved games',
    success: 'Saved games cleared.',
    failure: 'Saved games could not be cleared. Please try again.',
  },
  statistics: {
    title: 'Clear statistics?',
    description: 'Game totals and best results will be reset. Saved games and settings will stay.',
    confirm: 'Clear statistics',
    success: 'Statistics cleared.',
    failure: 'Statistics could not be cleared. Please try again.',
  },
  preferences: {
    title: 'Reset preferences?',
    description: 'Display and game preferences will return to their defaults. Saved games and statistics will stay.',
    confirm: 'Reset preferences',
    success: 'Preferences reset to their defaults.',
    failure: 'Preferences could not be reset. Please try again.',
  },
}

export const LocalDataPanel = ({ onSavedGamesCleared, onPreferencesReset }: Props) => {
  const [action, setAction] = useState<Action | null>(null)
  const [message, setMessage] = useState<{ text: string; failed: boolean } | null>(null)
  const [busy, setBusy] = useState(false)

  const confirm = async () => {
    if (!action || busy) return
    setBusy(true)
    setMessage(null)
    const succeeded = action === 'saves'
      ? await clearAllActiveSaves()
      : action === 'statistics'
        ? await clearAllStatistics()
        : onPreferencesReset()
    setBusy(false)
    setMessage({ text: succeeded ? actionContent[action].success : actionContent[action].failure, failed: !succeeded })
    if (succeeded) {
      if (action === 'saves') onSavedGamesCleared()
      setAction(null)
    }
  }

  return (
    <section aria-labelledby="local-data-title" className="space-y-3 border-t border-zinc-400/70 pt-4">
      <h2 id="local-data-title" className="text-xl font-semibold">Your data</h2>
      <p className="text-base leading-relaxed">Manage saved games, statistics, and preferences stored on this device. Offline app files are not affected.</p>
      <div className="flex flex-wrap gap-3">
        {(Object.keys(actionContent) as Action[]).map((key) => (
          <button key={key} type="button" onClick={() => { setMessage(null); setAction(key) }} className="zen-game-button">
            {actionContent[key].confirm}
          </button>
        ))}
      </div>
      {message && !action ? <p role={message.failed ? 'alert' : 'status'} aria-live={message.failed ? 'assertive' : 'polite'} className="text-base">{message.text}</p> : null}
      {action ? <GameDialog alert title={actionContent[action].title} description={actionContent[action].description} onDismiss={() => { if (!busy) setAction(null) }}>
        {message?.failed ? <p role="alert">{message.text}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={busy} onClick={() => setAction(null)} className="zen-game-button">Keep data</button>
          <button type="button" disabled={busy} onClick={() => void confirm()} className="zen-game-button">{busy ? 'Please wait' : actionContent[action].confirm}</button>
        </div>
      </GameDialog> : null}
    </section>
  )
}
