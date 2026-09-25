import { useEffect, useMemo, useReducer, useRef, useState, type DragEvent } from 'react'
import type { AppSettings } from '../../../lib/settings'
import { deleteActiveSave, saveActiveGame, createSessionId } from '../../../persistence/gameSave'
import { readStatistics, recordGameCompleted, recordGameStarted } from '../../../persistence/statistics'
import type { GameStatistics } from '../../../persistence/types'
import { applyMove, dealFromStock, undo } from '../model/engine'
import { createInitialState } from '../model/deal'
import { serializeSolitaireState } from '../model/persistence'
import { loadSolitaireSave, type SolitaireSaveState } from '../save'
import { findFoundationMove, findHint, getAutoFinishPlan, getTopCard, isValidMove, isWin, sameLocation, type SolitaireHint } from '../model/rules'
import type { Card, Location, Move, SolitaireState, StockDrawCount } from '../model/types'
import { CardView } from './CardView'
import { PileView } from './PileView'
import { GameToolbar } from '../../../components/GameToolbar'
import { GameDialog } from '../../../components/GameDialog'

type Props = {
  settings: AppSettings
  onBack: () => void
  onSaveAvailabilityChange: (hasSave: boolean) => void
}

type DragState = {
  location: Location
  cardId: string
  cards: Card[]
  x: number
  y: number
} | null

type Action =
  | { type: 'move'; move: Move }
  | { type: 'deal'; drawCount: StockDrawCount }
  | { type: 'undo' }
  | { type: 'new' }
  | { type: 'restore'; state: SolitaireState }

const reducer = (state: SolitaireState, action: Action): SolitaireState => {
  if (action.type === 'move') return applyMove(state, action.move)
  if (action.type === 'deal') return dealFromStock(state, action.drawCount)
  if (action.type === 'undo') return undo(state)
  if (action.type === 'new') return createInitialState()
  if (action.type === 'restore') return action.state
  return state
}

const rankNames: Record<Card['rank'], string> = {
  A: 'Ace', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
  J: 'Jack', Q: 'Queen', K: 'King',
}

const describeCard = (card?: Card): string => card
  ? `${rankNames[card.rank]} of ${card.suit[0].toUpperCase()}${card.suit.slice(1)}`
  : 'empty'

const cardCount = (count: number): string => `${count} ${count === 1 ? 'card' : 'cards'}`

export const SolitaireScreen = ({ settings, onBack, onSaveAvailabilityChange }: Props) => {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const [ready, setReady] = useState(false)
  const [gameDrawMode, setGameDrawMode] = useState(settings.drawMode)
  const session = useRef<{ sessionId: string; createdAt: string } | null>(null)
  const persistenceQueue = useRef<Promise<void>>(Promise.resolve())
  const [selected, setSelected] = useState<{ location: Location; cardId: string } | null>(null)
  const [invalidMove, setInvalidMove] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [hint, setHint] = useState<SolitaireHint | null>(null)
  const [hintMessage, setHintMessage] = useState('')
  const [showRules, setShowRules] = useState(false)
  const [statistics, setStatistics] = useState<GameStatistics | null>(null)
  const [pendingAction, setPendingAction] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState === 'visible')
  const [dragging, setDragging] = useState<DragState>(null)
  const motionEnabled = !settings.reducedMotion
  const autoFinishPlan = useMemo(() => getAutoFinishPlan(state), [state])

  useEffect(() => {
    let mounted = true
    void (async () => {
      const save = await loadSolitaireSave()
      if (!mounted) return
      if (save) {
        session.current = { sessionId: save.sessionId, createdAt: save.createdAt }
        setGameDrawMode(save.state.drawMode)
        dispatch({ type: 'restore', state: save.state.gameState })
      } else {
        const nextSession = { sessionId: createSessionId(), createdAt: new Date().toISOString() }
        session.current = nextSession
        await recordGameStarted('solitaire')
      }
      if (mounted) setReady(true)
    })()
    return () => { mounted = false }
  }, [onSaveAvailabilityChange])

  useEffect(() => {
    if (!ready || !session.current) return
    const snapshot = serializeSolitaireState(state)
    const currentSession = session.current
    persistenceQueue.current = persistenceQueue.current.then(async () => {
      if (isWin(snapshot)) {
        const recorded = await recordGameCompleted('solitaire', currentSession.sessionId, snapshot.history.length)
        if (recorded) {
          await deleteActiveSave('solitaire')
          onSaveAvailabilityChange(false)
        }
        return
      }
      const savedState: SolitaireSaveState = { gameState: snapshot, drawMode: gameDrawMode }
      if (await saveActiveGame('solitaire', savedState, currentSession)) onSaveAvailabilityChange(true)
    })
  }, [gameDrawMode, onSaveAvailabilityChange, ready, state])

  useEffect(() => {
    if (!showRules) return
    void readStatistics('solitaire').then(setStatistics)
  }, [showRules])

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', updateVisibility)
    return () => document.removeEventListener('visibilitychange', updateVisibility)
  }, [])

  useEffect(() => {
    if (!ready || !settings.timer || settings.calmStats || isWin(state) || !pageVisible) return undefined
    const intervalId = window.setInterval(() => setElapsedSeconds((current) => current + 1), 1000)
    return () => window.clearInterval(intervalId)
  }, [pageVisible, ready, settings.calmStats, settings.timer, state])

  const destinations = useMemo(() => {
    if (!selected) return [] as Location[]
    const all: Location[] = [
      ...state.tableau.map((_, index) => ({ type: 'tableau', index }) as Location),
      ...state.foundations.map((_, index) => ({ type: 'foundation', index }) as Location),
    ]
    return all.filter((to) =>
      isValidMove(state, {
        from: selected.location,
        to,
        cardId: selected.cardId,
      }),
    )
  }, [selected, state])

  const canDrop = (target: Location): boolean => destinations.some((destination) => sameLocation(destination, target))

  const clearSelection = () => {
    setSelected(null)
    setInvalidMove(false)
    setDragging(null)
  }

  const startNewGame = () => {
    const nextSession = { sessionId: createSessionId(), createdAt: new Date().toISOString() }
    session.current = nextSession
    setGameDrawMode(settings.drawMode)
    persistenceQueue.current = persistenceQueue.current.then(async () => { await recordGameStarted('solitaire') })
    dispatch({ type: 'new' })
    setElapsedSeconds(0)
    setHint(null)
    setHintMessage('')
    setPendingAction(false)
    clearSelection()
  }

  const requestNewGame = () => {
    if (state.history.length > 0 && !isWin(state)) {
      setPendingAction(true)
      return
    }
    startNewGame()
  }

  const undoMove = () => {
    dispatch({ type: 'undo' })
    setHint(null)
    setHintMessage('')
    clearSelection()
  }

  const dismissHint = () => {
    setHint(null)
    setHintMessage('')
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const toggleWasteSelection = () => {
    if (state.waste.length === 0) return
    const card = state.waste[state.waste.length - 1]
    if (selected?.location.type === 'waste' && selected.cardId === card.id) {
      clearSelection()
      dismissHint()
      return
    }
    setSelected({ location: { type: 'waste' }, cardId: card.id })
    setInvalidMove(false)
    dismissHint()
  }

  const selectTableauCard = (index: number, cardId: string) => {
    if (selected?.location.type === 'tableau' && selected.location.index === index && selected.cardId === cardId) {
      clearSelection()
      return
    }
    setSelected({ location: { type: 'tableau', index }, cardId })
    setInvalidMove(false)
    dismissHint()
  }

  const updateDragPosition = (event: DragEvent<HTMLElement>) => {
    if (event.clientX === 0 && event.clientY === 0) return
    setDragging((current) => (current ? { ...current, x: event.clientX, y: event.clientY } : current))
  }

  const stopDragging = () => {
    setDragging(null)
  }

  const startWasteDrag = (event: DragEvent<HTMLElement>) => {
    if (state.waste.length === 0) return
    const card = state.waste[state.waste.length - 1]
    setSelected({ location: { type: 'waste' }, cardId: card.id })
    setDragging({ location: { type: 'waste' }, cardId: card.id, cards: [card], x: event.clientX, y: event.clientY })
    setInvalidMove(false)
  }

  const startTableauDrag = (index: number, cardId: string, event: DragEvent<HTMLElement>) => {
    const cardIndex = state.tableau[index].findIndex((card) => card.id === cardId)
    const cards = cardIndex >= 0 ? state.tableau[index].slice(cardIndex) : []
    setSelected({ location: { type: 'tableau', index }, cardId })
    setDragging({ location: { type: 'tableau', index }, cardId, cards, x: event.clientX, y: event.clientY })
    setInvalidMove(false)
  }

  const attemptMove = (to: Location) => {
    dismissHint()
    if (!selected) return
    const move: Move = { from: selected.location, to, cardId: selected.cardId }
    if (applyLegalMove(move)) {
      return
    }
    stopDragging()
    setInvalidMove(true)
    setTimeout(() => setInvalidMove(false), 600)
  }

  const applyLegalMove = (move: Move) => {
    if (!isValidMove(state, move)) return false
    dispatch({ type: 'move', move })
    dismissHint()
    setInvalidMove(false)
    clearSelection()
    return true
  }

  const attemptFoundationMove = (location: Location, cardId: string) => {
    dismissHint()
    const move = findFoundationMove(state, location, cardId)
    if (move) {
      applyLegalMove(move)
    }
  }

  const autoFinish = () => {
    autoFinishPlan?.forEach((move) => dispatch({ type: 'move', move }))
    dismissHint()
    clearSelection()
  }

  const deal = () => {
    dispatch({ type: 'deal', drawCount: gameDrawMode === 'three' ? 3 : 1 })
    dismissHint()
    clearSelection()
  }

  const showHint = () => {
    const suggestion = findHint(state)
    setHint(suggestion)
    setHintMessage(suggestion ? '' : 'No move found.')
  }

  if (!ready) {
    return <div role="status" aria-live="polite" className="zen-game-message">Checking for your saved game…</div>
  }

  const handleTableauCardClick = (index: number, card: Card) => {
    if (!card.faceUp) return
    if (selected?.location.type === 'tableau' && selected.location.index === index && selected.cardId === card.id) {
      clearSelection()
      dismissHint()
      return
    }
    if (selected) {
      if (applyLegalMove({ from: selected.location, to: { type: 'tableau', index }, cardId: selected.cardId })) return
      setInvalidMove(true)
      setTimeout(() => setInvalidMove(false), 900)
      return
    }
    selectTableauCard(index, card.id)
  }

  const hintSource = (location: Location, cardId: string): boolean =>
    hint?.type === 'move' && sameLocation(hint.move.from, location) && hint.move.cardId === cardId

  const hintDestination = (location: Location): boolean =>
    hint?.type === 'move' && sameLocation(hint.move.to, location)

  const hintDescription = (): string => {
    if (hint?.type === 'deal') return 'Try drawing from the stock.'
    if (hint?.type !== 'move') return hintMessage
    const card = hint.move.from.type === 'waste'
      ? getTopCard(state.waste)
      : hint.move.from.type === 'tableau'
        ? state.tableau[hint.move.from.index]?.find((item) => item.id === hint.move.cardId)
        : undefined
    const target = hint.move.to.type === 'tableau'
      ? `tableau column ${hint.move.to.index + 1}`
      : hint.move.to.type === 'foundation'
        ? `foundation ${hint.move.to.index + 1}`
        : 'waste pile'
    return `Try moving ${describeCard(card)} to ${target}.`
  }

  return (
    <div className={`zen-solitaire-table relative flex min-h-0 flex-col gap-4 ${(settings.gamePieceScale === 'large') ? 'zen-large-cards' : ''} ${settings.reducedMotion ? 'motion-reduce' : ''}`}>
      <GameToolbar className={settings.handedness === 'left' ? 'order-2' : ''}>
        <button type="button" onClick={requestNewGame} className="zen-game-button">
          New Game
        </button>
        <button type="button" onClick={undoMove} disabled={state.history.length === 0} className="zen-game-button">
          Undo
        </button>
        <button type="button" onClick={showHint} className="zen-game-button">
          Hint
        </button>
        <button type="button" onClick={() => setShowRules(true)} className="zen-game-button">
          Rules
        </button>
        {selected ? <button type="button" onClick={clearSelection} className="zen-game-button">Cancel selection</button> : null}
        {autoFinishPlan ? (
          <button type="button" onClick={autoFinish} className="zen-game-button">
            Auto-finish
          </button>
        ) : null}
        {!settings.calmStats ? (
          <div className="ml-auto flex w-full min-w-0 flex-wrap justify-between gap-x-4 gap-y-1 text-lg font-semibold text-white sm:w-auto sm:justify-end">
            <span className="zen-game-stat">Moves {state.history.length}</span>
            {settings.timer ? (
              <span className="zen-game-stat">Time {formatTime(elapsedSeconds)}</span>
            ) : null}
          </div>
        ) : null}
      </GameToolbar>

      <div className="zen-card-row">
        <div className="zen-top-card-row gap-4 md:gap-8">
          <div className="flex gap-1 md:gap-3">
            <button
              type="button"
              onClick={deal}
              className={`zen-card-button ${hint?.type === 'deal' ? 'zen-hint-source' : ''}`}
              aria-label={`Stock, ${cardCount(state.stock.length)} remaining${gameDrawMode === 'three' ? ', draw three' : ', draw one'}`}
            >
              <CardView card={getTopCard(state.stock)} placeholder={state.stock.length === 0} largeCards={(settings.gamePieceScale === 'large')} animate={motionEnabled} />
            </button>
            <button
              type="button"
              onClick={toggleWasteSelection}
              onDoubleClick={() => {
                const top = getTopCard(state.waste)
                if (top) attemptFoundationMove({ type: 'waste' }, top.id)
              }}
              className="zen-card-button"
              aria-label={`Waste pile, ${describeCard(getTopCard(state.waste))}, ${cardCount(state.waste.length)}`}
              aria-pressed={selected?.location.type === 'waste'}
            >
              <CardView
                card={getTopCard(state.waste)}
                placeholder={state.waste.length === 0}
                largeCards={(settings.gamePieceScale === 'large')}
                selected={selected?.location.type === 'waste'}
                hinted={hintSource({ type: 'waste' }, getTopCard(state.waste)?.id ?? '')}
                onDoubleClick={state.waste.length > 0 ? () => attemptFoundationMove({ type: 'waste' }, state.waste[state.waste.length - 1].id) : undefined}
                onDragStart={state.waste.length > 0 ? startWasteDrag : undefined}
                onDrag={updateDragPosition}
                onDragEnd={stopDragging}
                ghosted={dragging?.location.type === 'waste'}
                animate={motionEnabled}
              />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1 md:gap-3">
            {state.foundations.map((pile, index) => (
              <button
                key={`f-${index}`}
                type="button"
                onClick={() => attemptMove({ type: 'foundation', index })}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  attemptMove({ type: 'foundation', index })
                }}
                className="zen-card-button"
                aria-label={`Foundation ${getTopCard(pile)?.suit ?? `column ${index + 1}`}, ${describeCard(getTopCard(pile))}`}
              >
                <div className={`${canDrop({ type: 'foundation', index }) ? 'zen-drop-target' : ''} ${hintDestination({ type: 'foundation', index }) ? 'zen-hint-destination' : ''}`}>
                  <CardView card={getTopCard(pile)} placeholder={pile.length === 0} largeCards={(settings.gamePieceScale === 'large')} animate={motionEnabled} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="zen-card-row">
        <div className="zen-card-grid gap-1 md:gap-3">
          {state.tableau.map((pile, index) => (
            <PileView
              key={`t-${index}`}
              cards={pile}
              columnIndex={index}
              ariaLabel={`Tableau column ${index + 1}, ${cardCount(pile.length)}, ${describeCard(getTopCard(pile))}`}
              largeCards={(settings.gamePieceScale === 'large')}
              selectedCardId={selected?.cardId}
              canDrop={canDrop({ type: 'tableau', index })}
              onEmptyClick={() => attemptMove({ type: 'tableau', index })}
              onPileClick={() => attemptMove({ type: 'tableau', index })}
              onPileDrop={() => attemptMove({ type: 'tableau', index })}
              onCardDragStart={(card, event) => startTableauDrag(index, card.id, event)}
              onCardDrag={updateDragPosition}
              onCardDragEnd={stopDragging}
              onCardDoubleClick={(card) => {
                if (!card.faceUp) return
                attemptFoundationMove({ type: 'tableau', index }, card.id)
              }}
              draggingCardId={dragging?.location.type === 'tableau' && dragging.location.index === index ? dragging.cardId : undefined}
              hintedCardId={hint?.type === 'move' && hint.move.from.type === 'tableau' && hint.move.from.index === index ? hint.move.cardId : undefined}
              hintedDestination={hintDestination({ type: 'tableau', index })}
              motionEnabled={motionEnabled}
              onCardClick={(card) => {
                handleTableauCardClick(index, card)
              }}
            />
          ))}
        </div>
      </div>

      {invalidMove ? <div role="status" aria-live="polite" className="zen-game-message">That card cannot go there.</div> : null}

      {dragging ? (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: 0,
            top: 0,
            transform: `translate3d(${dragging.x + 14}px, ${dragging.y + 14}px, 0)`,
          }}
        >
          <div className="relative drop-shadow-xl">
            {dragging.cards.map((card, index) => (
              <div key={card.id} className="absolute" style={{ top: `${index * ((settings.gamePieceScale === 'large') ? 56 : 48)}px` }}>
                <CardView card={card} largeCards={(settings.gamePieceScale === 'large')} />
              </div>
            ))}
            <div style={{ height: `${(dragging.cards.length - 1) * ((settings.gamePieceScale === 'large') ? 56 : 48) + ((settings.gamePieceScale === 'large') ? 128 : 112)}px` }} />
          </div>
        </div>
      ) : null}

      {hint || hintMessage ? (
        <div role="status" aria-live="polite" className="zen-game-message flex flex-wrap items-center justify-between gap-3">
          <span>{hintDescription()}</span>
          {hint ? <button type="button" onClick={dismissHint} className="zen-game-button">Dismiss hint</button> : null}
        </div>
      ) : null}

      {isWin(state) ? (
        <GameDialog title="You did it." description="All cards are safely in the foundations.">
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={startNewGame} className="zen-game-button">New Game</button>
            <button type="button" onClick={onBack} className="zen-game-button">Back to Games</button>
          </div>
        </GameDialog>
      ) : null}

      {pendingAction ? (
        <GameDialog
          alert
          title="Start a new game?"
          description="Your current game will be replaced."
          onDismiss={() => setPendingAction(false)}
        >
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setPendingAction(false)} className="zen-game-button">Keep playing</button>
            <button type="button" onClick={startNewGame} className="zen-game-button">New game</button>
          </div>
        </GameDialog>
      ) : null}

      {showRules ? (
        <GameDialog title="How to play Solitaire" onDismiss={() => setShowRules(false)}>
          <div className="max-h-[65vh] space-y-3 overflow-y-auto text-base leading-relaxed">
            <section><h3 className="font-bold">Goal</h3><p>Move all 52 cards to the four foundations, building each suit from Ace to King.</p></section>
            <section><h3 className="font-bold">Tableau</h3><p>Build columns down in alternating red and black. Move a face-up card or a correctly ordered face-up stack. Only a King may start an empty column.</p></section>
            <section><h3 className="font-bold">Foundations</h3><p>Build each foundation up by suit, starting with an Ace.</p></section>
            <section><h3 className="font-bold">Stock and waste</h3><p>Tap the stock to draw {gameDrawMode === 'three' ? 'up to three cards' : 'one card'}. When it is empty, tap it again to turn the waste back over.</p></section>
            <section><h3 className="font-bold">Controls</h3><p>Tap a card or stack, then tap a destination. Tap it again to cancel. Double-tap a suitable card to send it to a foundation. Use Undo to take back your last move or stock action.</p></section>
            <section aria-labelledby="solitaire-statistics-title">
              <h3 id="solitaire-statistics-title" className="font-bold">Statistics</h3>
              {statistics ? <p>{statistics.gamesStarted} games started · {statistics.gamesCompleted} completed · {statistics.totalMoves} moves in completed games{statistics.bestMoves === null ? '' : ` · best ${statistics.bestMoves} moves`}</p> : <p>Statistics are stored on this device.</p>}
            </section>
          </div>
          <button type="button" onClick={() => setShowRules(false)} className="zen-game-button">Close rules</button>
        </GameDialog>
      ) : null}
    </div>
  )
}
