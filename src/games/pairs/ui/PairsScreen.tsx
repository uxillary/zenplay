import { useEffect, useReducer, useRef, useState } from 'react'
import type { AppSettings } from '../../../lib/settings'
import { createSessionId, deleteActiveSave, saveActiveGame } from '../../../persistence/gameSave'
import { readStatistics, recordGameCompleted, recordGameStarted } from '../../../persistence/statistics'
import type { GameStatistics } from '../../../persistence/types'
import { GameDialog } from '../../../components/GameDialog'
import { GameToolbar } from '../../../components/GameToolbar'
import { createPairsState, getHintCardId, hideMismatchedCards, isPairsComplete, revealPairCard } from '../model/engine'
import { restorePairsState, serializePairsState } from '../model/persistence'
import { PAIR_FACES, PAIRS_PER_BOARD_SIZE, type PairFaceId, type PairsBoardSize, type PairsState } from '../model/types'
import { loadPairsSave } from '../save'
import { PairFaceIcon } from './PairFaceIcon'

type Props = {
  settings: AppSettings
  onBack: () => void
  onSaveAvailabilityChange: (hasSave: boolean) => void
}

type Action =
  | { type: 'restore'; state: PairsState }
  | { type: 'new'; state: PairsState }
  | { type: 'replace'; state: PairsState }

const reducer = (state: PairsState, action: Action): PairsState => {
  if (action.type === 'restore' || action.type === 'new' || action.type === 'replace') return action.state
  return state
}

const boardSizeLabel: Record<PairsBoardSize, string> = {
  easy: 'Easy',
  standard: 'Standard',
  more: 'More',
}

const faceLabel = (faceId: PairFaceId): string => PAIR_FACES.find(({ id }) => id === faceId)?.label ?? 'symbol'

export const PairsScreen = ({ settings, onBack, onSaveAvailabilityChange }: Props) => {
  const [state, dispatch] = useReducer(reducer, undefined, () => createPairsState('easy'))
  const [ready, setReady] = useState(false)
  const [selectedBoardSize, setSelectedBoardSize] = useState<PairsBoardSize>('easy')
  const [showNewGame, setShowNewGame] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [mismatchPending, setMismatchPending] = useState(false)
  const [hintCardId, setHintCardId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [statistics, setStatistics] = useState<GameStatistics | null>(null)
  const boardStateRef = useRef(state)
  const mismatchLocked = useRef(false)
  const activeHint = useRef<string | null>(null)
  const session = useRef<{ sessionId: string; createdAt: string } | null>(null)
  const persistenceQueue = useRef<Promise<void>>(Promise.resolve())
  const mismatchTimer = useRef<number | null>(null)
  const hintTimer = useRef<number | null>(null)

  useEffect(() => {
    let mounted = true
    void (async () => {
      const save = await loadPairsSave()
      if (!mounted) return
      const restored = save ? restorePairsState(save.state) : null
      if (save && restored) {
        session.current = { sessionId: save.sessionId, createdAt: save.createdAt }
        boardStateRef.current = restored
        dispatch({ type: 'restore', state: restored })
        if (isPairsComplete(restored)) setShowCompletion(true)
      } else {
        session.current = { sessionId: createSessionId(), createdAt: new Date().toISOString() }
        await recordGameStarted('pairs')
      }
      if (mounted) setReady(true)
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!ready || !session.current) return
    const snapshot = serializePairsState(state)
    const currentSession = session.current
    persistenceQueue.current = persistenceQueue.current.then(async () => {
      if (isPairsComplete(snapshot)) {
        const recorded = await recordGameCompleted('pairs', currentSession.sessionId, snapshot.turns, undefined, snapshot.boardSize)
        if (recorded) {
          await deleteActiveSave('pairs')
          onSaveAvailabilityChange(false)
        }
        return
      }
      if (await saveActiveGame('pairs', snapshot, currentSession)) onSaveAvailabilityChange(true)
    })
  }, [onSaveAvailabilityChange, ready, state])

  useEffect(() => {
    if (showRules) void readStatistics('pairs').then(setStatistics)
  }, [showRules])

  useEffect(() => () => {
    if (mismatchTimer.current !== null) window.clearTimeout(mismatchTimer.current)
    if (hintTimer.current !== null) window.clearTimeout(hintTimer.current)
  }, [])

  const complete = isPairsComplete(state)
  const hasProgress = !complete && (state.turns > 0 || state.matchedPairIds.length > 0 || state.revealedCardIds.length > 0)

  const clearTransientTimers = () => {
    if (mismatchTimer.current !== null) window.clearTimeout(mismatchTimer.current)
    if (hintTimer.current !== null) window.clearTimeout(hintTimer.current)
    mismatchTimer.current = null
    hintTimer.current = null
    mismatchTimer.current = null
    hintTimer.current = null
    setMismatchPending(false)
    setHintCardId(null)
    mismatchLocked.current = false
    activeHint.current = null
  }

  const startNewGame = (boardSize = selectedBoardSize) => {
    clearTransientTimers()
    const nextSession = { sessionId: createSessionId(), createdAt: new Date().toISOString() }
    session.current = nextSession
    persistenceQueue.current = persistenceQueue.current.then(async () => { await recordGameStarted('pairs') })
    const nextState = createPairsState(boardSize)
    boardStateRef.current = nextState
    dispatch({ type: 'new', state: nextState })
    setSelectedBoardSize(boardSize)
    setMessage('')
    setShowNewGame(false)
    setShowCompletion(false)
  }

  const keepCurrentGame = () => {
    setShowNewGame(false)
    if (complete) setShowCompletion(true)
  }

  const onReveal = (cardId: string) => {
    if (!ready || mismatchLocked.current || activeHint.current) return
    const result = revealPairCard(boardStateRef.current, cardId)
    if (result.result === 'ignored') return
    boardStateRef.current = result.state
    dispatch({ type: 'replace', state: result.state })
    if (result.result === 'first') {
      setMessage('Card revealed. Choose another card.')
    } else if (result.result === 'match') {
      setMessage('Match.')
      if (isPairsComplete(result.state)) setShowCompletion(true)
    } else {
      mismatchLocked.current = true
      setMismatchPending(true)
      setMessage('Not a match. Take a moment to look at both cards.')
      mismatchTimer.current = window.setTimeout(() => {
        const nextState = hideMismatchedCards(boardStateRef.current)
        boardStateRef.current = nextState
        dispatch({ type: 'replace', state: nextState })
        mismatchLocked.current = false
        setMismatchPending(false)
        mismatchTimer.current = null
        setMessage('The cards are face down again. Choose a card to continue.')
      }, 1200)
    }
  }

  const requestHint = () => {
    if (mismatchLocked.current || activeHint.current) return
    const currentState = boardStateRef.current
    const cardId = getHintCardId(currentState)
    const card = currentState.cards.find((item) => item.id === cardId)
    if (!card) {
      setMessage('Every pair has been found.')
      return
    }
    activeHint.current = card.id
    setHintCardId(card.id)
    setMessage(`Hint: this card is a ${faceLabel(card.pairId)}. It will turn back over shortly.`)
    hintTimer.current = window.setTimeout(() => {
      setHintCardId(null)
      activeHint.current = null
      hintTimer.current = null
    }, 1800)
  }

  if (!ready) return <div role="status" aria-live="polite" className="zen-game-message">Loading Pairs…</div>

  const isMatched = (pairId: PairFaceId): boolean => state.matchedPairIds.includes(pairId)

  return (
    <div className={`pairs-screen -mx-4 space-y-3 sm:mx-0 ${settings.reducedMotion ? 'motion-reduce' : 'pairs-screen--animated'}`}>
      <GameToolbar>
        <button type="button" onClick={() => { setSelectedBoardSize(state.boardSize); setShowNewGame(true) }} className="zen-game-button">New Game</button>
        <button type="button" onClick={requestHint} disabled={complete || mismatchPending || Boolean(hintCardId)} className="zen-game-button">Hint</button>
        <button type="button" onClick={() => setShowRules(true)} className="zen-game-button">Rules</button>
        {!settings.calmStats ? <span className="ml-auto text-lg font-semibold">Turns: {state.turns}</span> : null}
      </GameToolbar>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-lg font-semibold">{boardSizeLabel[state.boardSize]} · {PAIRS_PER_BOARD_SIZE[state.boardSize]} pairs</p>
          <p className="text-base">{state.matchedPairIds.length} of {PAIRS_PER_BOARD_SIZE[state.boardSize]} pairs found</p>
        </div>
        <div
          role="group"
          aria-label={`${boardSizeLabel[state.boardSize]} Pairs cards`}
          className={`pairs-table-surface pairs-grid grid w-full grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 ${settings.gamePieceScale === 'large' ? 'pairs-grid--large' : ''}`}
        >
          {state.cards.map((card, index) => {
            const matched = isMatched(card.pairId)
            const revealed = matched || state.revealedCardIds.includes(card.id) || hintCardId === card.id
            const hinted = hintCardId === card.id
            const classes = [
              'pairs-card relative flex aspect-[4/5] min-h-0 min-w-0 flex-col items-center justify-center gap-1 rounded-md border-2 p-1 text-zinc-950 focus-visible:z-10',
              revealed ? 'pairs-card--face-up' : 'pairs-card--hidden',
              matched ? 'pairs-card--matched' : '',
              hinted ? 'pairs-card--hinted' : '',
            ].filter(Boolean).join(' ')
            const description = `Card ${index + 1}, ${revealed ? `${faceLabel(card.pairId)}${matched ? ', matched' : hinted ? ', shown by hint' : ''}` : 'hidden'}.`
            return (
              <button
                key={card.id}
                type="button"
                aria-label={description}
                aria-disabled={matched || mismatchPending || Boolean(hintCardId)}
                aria-pressed={revealed}
                className={classes}
                onClick={() => onReveal(card.id)}
              >
                {revealed ? <PairFaceIcon face={card.pairId} /> : <span aria-hidden="true" className="pairs-card-back-mark">?</span>}
                {matched ? <span className="pairs-matched-label">Matched</span> : null}
                {hinted ? <span className="sr-only">Shown by hint</span> : null}
              </button>
            )
          })}
        </div>
        <p className="min-h-7 text-base" role="status" aria-live="polite" aria-atomic="true">{message}</p>
      </div>

      {showNewGame ? (
        <GameDialog
          title="New Pairs game"
          description={hasProgress ? 'Starting a new game replaces your current progress. Choose a board size, then confirm to continue.' : 'Choose how many pairs to find.'}
          onDismiss={keepCurrentGame}
        >
          <div className="flex flex-wrap gap-2" role="group" aria-label="Board size">
            {(['easy', 'standard', 'more'] as const).map((size) => (
              <button key={size} type="button" onClick={() => setSelectedBoardSize(size)} aria-pressed={selectedBoardSize === size} className={`zen-game-button ${selectedBoardSize === size ? 'pairs-size-selected' : ''}`}>
                {boardSizeLabel[size]} · {PAIRS_PER_BOARD_SIZE[size]} pairs
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={keepCurrentGame} className="zen-game-button">Keep current game</button>
            <button type="button" onClick={() => startNewGame()} className="zen-game-button">Start new game</button>
          </div>
        </GameDialog>
      ) : null}

      {showRules ? (
        <GameDialog title="How to play Pairs" description="Turn over two cards at a time. Matching cards stay face up; non-matching cards turn back over after a short look. Find every pair to finish." onDismiss={() => setShowRules(false)}>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            <p>Choose Easy for 6 pairs, Standard for 8, or More for 12 pairs. A turn is two cards.</p>
            <p>Hint briefly shows one unmatched card. It turns face down again shortly, so take a moment to look.</p>
            <section aria-label="Pairs statistics">
              <h3 className="font-bold">Statistics</h3>
              {statistics ? <p>{statistics.gamesStarted} games started · {statistics.gamesCompleted} completed · 6 pairs: {statistics.completionBreakdown.easy ?? 0}, 8 pairs: {statistics.completionBreakdown.standard ?? 0}, 12 pairs: {statistics.completionBreakdown.more ?? 0}</p> : <p>Statistics are stored on this device.</p>}
            </section>
          </div>
          <button type="button" onClick={() => setShowRules(false)} className="zen-game-button">Close rules</button>
        </GameDialog>
      ) : null}

      {complete && showCompletion ? (
        <GameDialog title="You did it." description={`Every pair is found in ${state.turns} ${state.turns === 1 ? 'turn' : 'turns'}.`}>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => { setSelectedBoardSize(state.boardSize); setShowCompletion(false); setShowNewGame(true) }} className="zen-game-button">New Game</button>
            <button type="button" onClick={onBack} className="zen-game-button">Back to Games</button>
          </div>
        </GameDialog>
      ) : null}
    </div>
  )
}
