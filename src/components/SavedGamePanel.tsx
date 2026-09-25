import { useState } from 'react'
import { deleteActiveSave } from '../persistence/gameSave'
import { GameDialog } from './GameDialog'

type Props = {
  hasSave: boolean
  onSaveCleared: () => void
}

export const SavedGamePanel = ({ hasSave, onSaveCleared }: Props) => {
  const [confirmClear, setConfirmClear] = useState(false)
  const [message, setMessage] = useState('')

  const clearSave = async () => {
    if (await deleteActiveSave('solitaire')) {
      onSaveCleared()
      setMessage('Saved game cleared.')
    } else {
      setMessage('The saved game could not be cleared right now.')
    }
    setConfirmClear(false)
  }

  return (
    <section aria-labelledby="saved-game-title" className="space-y-3 rounded-lg border border-zinc-300 p-4 dark:border-zinc-600">
      <h2 id="saved-game-title" className="text-xl font-semibold">Saved game</h2>
      <p className="text-lg">{hasSave ? 'A Solitaire game is saved on this device.' : 'There is no saved Solitaire game.'}</p>
      {hasSave ? <button type="button" onClick={() => setConfirmClear(true)} className="zen-game-button">Clear saved game</button> : null}
      {message ? <p role="status" aria-live="polite" className="text-lg">{message}</p> : null}
      {confirmClear ? (
        <GameDialog alert title="Clear saved game?" description="This removes your saved Solitaire game. Your settings and statistics will stay." onDismiss={() => setConfirmClear(false)}>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setConfirmClear(false)} className="zen-game-button">Keep saved game</button>
            <button type="button" onClick={() => void clearSave()} className="zen-game-button">Clear saved game</button>
          </div>
        </GameDialog>
      ) : null}
    </section>
  )
}
