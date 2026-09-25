import { useEffect, useRef, useState } from 'react'
import type { AppSettings } from '../../../lib/settings'
import { createSessionId, deleteActiveSave, saveActiveGame } from '../../../persistence/gameSave'
import { readStatistics, recordGameCompleted, recordGameStarted } from '../../../persistence/statistics'
import type { GameStatistics } from '../../../persistence/types'
import { GameDialog } from '../../../components/GameDialog'
import { GameToolbar } from '../../../components/GameToolbar'
import { createShuffledFifteenState, isFifteenSolved, moveFifteenTile } from '../model/engine'
import { restoreFifteenState, serializeFifteenState } from '../model/persistence'
import type { FifteenState } from '../model/types'
import { loadFifteenSave } from '../save'

type Props = { settings: AppSettings; onBack: () => void; onSaveAvailabilityChange: (hasSave: boolean) => void }

export const FifteenScreen = ({ settings, onBack, onSaveAvailabilityChange }: Props) => {
  const [state, setState] = useState<FifteenState>(createShuffledFifteenState)
  const [ready, setReady] = useState(false)
  const [showNewPuzzle, setShowNewPuzzle] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [statistics, setStatistics] = useState<GameStatistics | null>(null)
  const [announcement, setAnnouncement] = useState('Slide a tile into the empty space.')
  const session = useRef<{ sessionId: string; createdAt: string } | null>(null)
  const persistenceQueue = useRef<Promise<void>>(Promise.resolve())
  const completedSession = useRef<string | null>(null)
  const complete = isFifteenSolved(state)
  const hasProgress = state.moves > 0 && !complete

  useEffect(() => {
    let mounted = true
    void (async () => {
      const save = await loadFifteenSave()
      if (!mounted) return
      const restored = save ? restoreFifteenState(save.state) : null
      if (save && restored) {
        session.current = { sessionId: save.sessionId, createdAt: save.createdAt }
        setState(restored)
        if (isFifteenSolved(restored)) setShowCompletion(true)
      } else {
        session.current = { sessionId: createSessionId(), createdAt: new Date().toISOString() }
        await recordGameStarted('fifteen')
      }
      if (mounted) setReady(true)
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!ready || !session.current) return
    const snapshot = serializeFifteenState(state)
    const currentSession = session.current
    persistenceQueue.current = persistenceQueue.current.then(async () => {
      if (isFifteenSolved(snapshot)) {
        if (completedSession.current !== currentSession.sessionId) {
          completedSession.current = currentSession.sessionId
          const recorded = await recordGameCompleted('fifteen', currentSession.sessionId, snapshot.moves)
          if (recorded) await deleteActiveSave('fifteen')
          onSaveAvailabilityChange(false)
        }
        return
      }
      if (await saveActiveGame('fifteen', snapshot, currentSession)) onSaveAvailabilityChange(true)
    })
  }, [onSaveAvailabilityChange, ready, state])

  useEffect(() => {
    if (showRules) void readStatistics('fifteen').then(setStatistics)
  }, [showRules])

  const startNewPuzzle = () => {
    const nextSession = { sessionId: createSessionId(), createdAt: new Date().toISOString() }
    session.current = nextSession
    completedSession.current = null
    const next = createShuffledFifteenState()
    setState(next)
    setShowNewPuzzle(false)
    setShowCompletion(false)
    setAnnouncement('New solvable puzzle. Slide a tile into the empty space.')
    persistenceQueue.current = persistenceQueue.current.then(async () => { await recordGameStarted('fifteen') })
  }

  const moveTile = (index: number) => {
    if (!ready || complete || showNewPuzzle || showRules) return
    const next = moveFifteenTile(state, index)
    if (next === state) return
    setState(next)
    if (isFifteenSolved(next)) {
      setAnnouncement('Puzzle solved. You did it.')
      setShowCompletion(true)
    } else setAnnouncement(`Move ${next.moves}.`)
  }

  const requestNewPuzzle = () => {
    if (hasProgress) setShowNewPuzzle(true)
    else startNewPuzzle()
  }

  const piecesLarge = settings.gamePieceScale === 'large' || settings.simpleMode
  return <div className="fifteen-screen space-y-3">
    <GameToolbar>
      <button type="button" onClick={requestNewPuzzle} className="zen-game-button">New Puzzle</button>
      <button type="button" onClick={() => setShowRules(true)} className="zen-game-button">Rules</button>
      <span className="ml-auto text-lg font-semibold">Moves: {state.moves}</span>
    </GameToolbar>
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    <div className={`fifteen-board ${piecesLarge ? 'fifteen-board--large' : ''}`} role="group" aria-label="Fifteen Puzzle. Use Tab to focus a tile, then Enter or Space to slide it into the empty space.">
      {state.tiles.map((tile, index) => {
        const row = Math.floor(index / 4) + 1
        const column = index % 4 + 1
        const empty = tile === null
        return <button
          key={index}
          type="button"
          className={`fifteen-tile ${empty ? 'fifteen-tile--empty' : ''}`}
          aria-label={empty ? `Empty space, row ${row}, column ${column}` : `Tile ${tile}, row ${row}, column ${column}`}
          aria-disabled={empty || !ready || complete}
          onClick={() => moveTile(index)}
        >{tile ?? <span aria-hidden="true">·</span>}</button>
      })}
    </div>
    <p className="fifteen-instructions">Slide a numbered tile into the empty space.</p>

    {showNewPuzzle ? <GameDialog title="Start a new puzzle?" description="Starting a new puzzle replaces your unfinished arrangement." onDismiss={() => setShowNewPuzzle(false)}>
      <div className="flex flex-wrap gap-3"><button type="button" onClick={startNewPuzzle} className="zen-game-button zen-game-button--primary">New Puzzle</button><button type="button" onClick={() => setShowNewPuzzle(false)} className="zen-game-button">Keep Current Puzzle</button></div>
    </GameDialog> : null}
    {showRules ? <GameDialog title="How to play Fifteen Puzzle" description="Slide a numbered tile into the empty space. Only a tile next to the empty space can move. Arrange tiles from 1 to 15, with the empty space in the bottom-right corner. Every new puzzle can be solved." onDismiss={() => setShowRules(false)}>
      <p className="text-lg">Use Tab to focus tiles and Enter or Space to move a focused tile. The empty space is labelled but cannot be moved. {statistics ? `${statistics.gamesStarted} puzzles started · ${statistics.gamesCompleted} completed · best: ${statistics.bestMoves ?? 'not yet set'} moves.` : 'Statistics are stored on this device.'}</p>
      <button type="button" onClick={() => setShowRules(false)} className="zen-game-button">Close Rules</button>
    </GameDialog> : null}
    {complete && showCompletion ? <GameDialog title="You did it." description={`Puzzle solved in ${state.moves} moves.`}>
      <div className="flex flex-wrap gap-3"><button type="button" onClick={startNewPuzzle} className="zen-game-button zen-game-button--primary">New Puzzle</button><button type="button" onClick={onBack} className="zen-game-button">Back to Games</button></div>
    </GameDialog> : null}
  </div>
}
