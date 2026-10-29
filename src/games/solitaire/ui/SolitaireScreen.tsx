import { useEffect, useMemo, useReducer, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import type { AppSettings, SolitaireCardBack, SolitaireCardFaces, SolitaireCardStyle, SolitaireTableTheme } from '../../../lib/settings'
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
import { describeSelectedSolitaireCard, describeSolitaireCard } from './cardAccessibility'
import { foundationGuideSuits } from './cardArtwork'
import { ACTION_FEEDBACK_MS, INVALID_FEEDBACK_MS, resolveFeedback } from './feedback'
import { GameToolbar } from '../../../components/GameToolbar'
import { GameDialog } from '../../../components/GameDialog'
import { canStartDragPointer, crossedDragThreshold, legalDropMove, shouldSuppressDraggedClick } from './dragGesture'

type Props = {
  settings: AppSettings
  onBack: () => void
  onSaveAvailabilityChange: (hasSave: boolean) => void
  onSaveFailure: () => void
  onSaveRecovery: () => void
  onSettingChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
}

type SolitaireDialog = 'menu' | 'rules' | 'appearance' | 'options' | null

type DragState = {
  location: Location
  cardId: string
  cards: Card[]
  x: number
  y: number
  width: number
  height: number
  step: string
} | null

type PointerGesture = {
  pointerId: number
  startX: number
  startY: number
  grabX: number
  grabY: number
  location: Location
  cardId: string
  cards: Card[]
  width: number
  height: number
  step: string
  started: boolean
}

const dropLocationAt = (x: number, y: number): Location | null => {
  const target = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-solitaire-drop]')
  const value = target?.dataset.solitaireDrop
  if (!value) return null
  const [type, rawIndex] = value.split(':')
  const index = Number(rawIndex)
  return (type === 'tableau' || type === 'foundation') && Number.isInteger(index) ? { type, index } : null
}

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

const cardCount = (count: number): string => `${count} ${count === 1 ? 'card' : 'cards'}`

const ToolbarIcon = ({ name }: { name: 'new' | 'undo' | 'hint' | 'menu' }) => (
  <svg className="zen-solitaire-action__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {name === 'new' ? <><rect x="7" y="3" width="13" height="17" rx="2" /><path d="M4 7v12a2 2 0 0 0 2 2h10M11 8h5m-2.5-2.5v5" /></> : null}
    {name === 'undo' ? <><path d="M9 6 4 11l5 5" /><path d="M4 11h10a6 6 0 1 1-5.2 9" /></> : null}
    {name === 'hint' ? <><path d="M9 17h6m-5 3h4M9 14c-1.2-1.1-2-2.4-2-4a5 5 0 0 1 10 0c0 1.6-.8 2.9-2 4l-.8 2h-4.4z" /></> : null}
    {name === 'menu' ? <><path d="M4 6h16M4 12h16M4 18h16" /></> : null}
  </svg>
)

export const SolitaireScreen = ({ settings, onBack, onSaveAvailabilityChange, onSaveFailure, onSaveRecovery, onSettingChange }: Props) => {
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
  const [activeDialog, setActiveDialog] = useState<SolitaireDialog>(null)
  const [actionMessage, setActionMessage] = useState('')
  const [statistics, setStatistics] = useState<GameStatistics | null>(null)
  const [pendingAction, setPendingAction] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState === 'visible')
  const [dragging, setDragging] = useState<DragState>(null)
  const [dropHover, setDropHover] = useState<Location | null>(null)
  const pointerGesture = useRef<PointerGesture | null>(null)
  const dragFrame = useRef<number | null>(null)
  const latestPointer = useRef<{ x: number; y: number } | null>(null)
  const suppressNextClick = useRef(false)
  const clickSuppressionTimeout = useRef<number | null>(null)
  const motionEnabled = !settings.reducedMotion
  const autoFinishPlan = useMemo(() => getAutoFinishPlan(state), [state])

  useEffect(() => {
    let mounted = true
    void (async () => {
      const result = await loadSolitaireSave()
      if (!mounted) return
      if (result.status === 'rejected') onSaveRecovery()
      const save = result.status === 'loaded' ? result.save : null
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
  }, [onSaveAvailabilityChange, onSaveRecovery])

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
      else onSaveFailure()
    })
  }, [gameDrawMode, onSaveAvailabilityChange, onSaveFailure, ready, state])

  useEffect(() => {
    if (activeDialog !== 'options') return
    void readStatistics('solitaire').then(setStatistics)
  }, [activeDialog])

  useEffect(() => {
    if (!actionMessage) return undefined
    const timeoutId = window.setTimeout(() => setActionMessage(''), ACTION_FEEDBACK_MS)
    return () => window.clearTimeout(timeoutId)
  }, [actionMessage])

  useEffect(() => {
    if (!invalidMove) return undefined
    const timeoutId = window.setTimeout(() => setInvalidMove(false), INVALID_FEEDBACK_MS)
    return () => window.clearTimeout(timeoutId)
  }, [invalidMove])

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', updateVisibility)
    return () => document.removeEventListener('visibilitychange', updateVisibility)
  }, [])

  useEffect(() => {
    const suppressDraggedClick = (event: MouseEvent) => {
      if (shouldSuppressDraggedClick(event.detail, suppressNextClick.current)) {
        suppressNextClick.current = false
        event.preventDefault()
        event.stopPropagation()
      }
    }
    document.addEventListener('click', suppressDraggedClick, true)
    return () => document.removeEventListener('click', suppressDraggedClick, true)
  }, [])

  useEffect(() => () => {
    if (dragFrame.current !== null) cancelAnimationFrame(dragFrame.current)
    if (clickSuppressionTimeout.current !== null) clearTimeout(clickSuppressionTimeout.current)
  }, [])

  useEffect(() => {
    if (!ready || !settings.timer || settings.calmStats || isWin(state) || !pageVisible) return undefined
    const intervalId = window.setInterval(() => setElapsedSeconds((current) => current + 1), 1000)
    return () => window.clearInterval(intervalId)
  }, [pageVisible, ready, settings.calmStats, settings.timer, state])

  const destinations = useMemo(() => {
    const source = dragging ?? selected
    if (!source) return [] as Location[]
    const all: Location[] = [
      ...state.tableau.map((_, index) => ({ type: 'tableau', index }) as Location),
      ...state.foundations.map((_, index) => ({ type: 'foundation', index }) as Location),
    ]
    return all.filter((to) =>
      isValidMove(state, {
        from: source.location,
        to,
        cardId: source.cardId,
      }),
    )
  }, [dragging, selected, state])

  const canDrop = (target: Location): boolean => destinations.some((destination) => sameLocation(destination, target))

  const clearSelection = () => {
    setSelected(null)
    setInvalidMove(false)
    setDragging(null)
    setDropHover(null)
    pointerGesture.current = null
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
    setActionMessage('')
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
    if (state.history.length === 0) return
    dispatch({ type: 'undo' })
    setHint(null)
    setHintMessage('')
    setActionMessage(`Last move undone. ${state.history.length - 1} moves remaining.`)
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
    setActionMessage('')
    setInvalidMove(false)
    dismissHint()
  }

  const selectTableauCard = (index: number, cardId: string) => {
    if (selected?.location.type === 'tableau' && selected.location.index === index && selected.cardId === cardId) {
      clearSelection()
      return
    }
    setSelected({ location: { type: 'tableau', index }, cardId })
    setActionMessage('')
    setInvalidMove(false)
    dismissHint()
  }

  const beginPointer = (location: Location, cardId: string, cards: Card[], event: PointerEvent<HTMLElement>) => {
    if (pointerGesture.current || !cards.length || !canStartDragPointer(event.pointerType, event.button)) return
    const rect = event.currentTarget.getBoundingClientRect()
    const step = getComputedStyle(event.currentTarget).getPropertyValue('--zen-faceup-step').trim()
    pointerGesture.current = {
      pointerId: event.pointerId, startX: event.clientX, startY: event.clientY,
      grabX: event.clientX - rect.left, grabY: event.clientY - rect.top,
      location, cardId, cards, width: rect.width, height: rect.height, step, started: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const suppressCompatibilityClick = () => {
    suppressNextClick.current = true
    if (clickSuppressionTimeout.current !== null) clearTimeout(clickSuppressionTimeout.current)
    clickSuppressionTimeout.current = window.setTimeout(() => { suppressNextClick.current = false }, 80)
  }

  const movePointer = (event: PointerEvent<HTMLElement>) => {
    const gesture = pointerGesture.current
    if (!gesture || gesture.pointerId !== event.pointerId) return
    if (!gesture.started && !crossedDragThreshold(gesture.startX, gesture.startY, event.clientX, event.clientY)) return
    if (!gesture.started) {
      gesture.started = true
      dismissHint()
      setSelected(null)
      setActionMessage('')
      setInvalidMove(false)
    }
    latestPointer.current = { x: event.clientX, y: event.clientY }
    if (dragFrame.current === null) dragFrame.current = requestAnimationFrame(() => {
      dragFrame.current = null
      const point = latestPointer.current
      if (pointerGesture.current !== gesture || !point) return
      setDragging({
        location: gesture.location, cardId: gesture.cardId, cards: gesture.cards,
        x: point.x - gesture.grabX, y: point.y - gesture.grabY,
        width: gesture.width, height: gesture.height, step: gesture.step,
      })
      setDropHover(dropLocationAt(point.x, point.y))
    })
  }

  const endPointer = (event: PointerEvent<HTMLElement>, cancelled = false) => {
    const gesture = pointerGesture.current
    if (!gesture || gesture.pointerId !== event.pointerId) return
    pointerGesture.current = null
    if (dragFrame.current !== null) cancelAnimationFrame(dragFrame.current)
    dragFrame.current = null
    latestPointer.current = null
    if (!gesture.started) {
      if (!cancelled && event.pointerType === 'touch') {
        suppressCompatibilityClick()
        if (gesture.location.type === 'waste') toggleWasteSelection()
        else if (gesture.location.type === 'tableau') {
          const card = state.tableau[gesture.location.index].find((item) => item.id === gesture.cardId)
          if (card) handleTableauCardClick(gesture.location.index, card)
        }
      }
      return
    }
    suppressCompatibilityClick()
    const to = cancelled ? null : dropLocationAt(event.clientX, event.clientY)
    const move = legalDropMove(state, gesture.location, gesture.cardId, to)
    if (move) applyLegalMove(move)
    setDragging(null)
    setDropHover(null)
  }

  const cancelPointer = (event: PointerEvent<HTMLElement>) => endPointer(event, true)

  const attemptMove = (to: Location) => {
    dismissHint()
    if (!selected) return
    const move: Move = { from: selected.location, to, cardId: selected.cardId }
    if (applyLegalMove(move)) {
      return
    }
    setDragging(null)
    setActionMessage('')
    setInvalidMove(true)
  }

  const applyLegalMove = (move: Move) => {
    if (!isValidMove(state, move)) return false
    dispatch({ type: 'move', move })
    dismissHint()
    const target = move.to.type === 'tableau' ? `tableau column ${move.to.index + 1}`
      : move.to.type === 'foundation' ? `foundation ${move.to.index + 1}` : 'waste'
    setActionMessage(`Card moved to ${target}.`)
    setInvalidMove(false)
    clearSelection()
    return true
  }

  const attemptFoundationMove = (location: Location, cardId: string) => {
    dismissHint()
    const move = findFoundationMove(state, location, cardId)
    if (move) {
      applyLegalMove(move)
    } else {
      setInvalidMove(true)
    }
  }

  const autoFinish = () => {
    autoFinishPlan?.forEach((move) => dispatch({ type: 'move', move }))
    setActiveDialog(null)
    setActionMessage('Cards moved to the foundations.')
    dismissHint()
    clearSelection()
  }

  const deal = () => {
    dispatch({ type: 'deal', drawCount: gameDrawMode === 'three' ? 3 : 1 })
    setActionMessage('')
    dismissHint()
    clearSelection()
  }

  const showHint = () => {
    setActionMessage('')
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
      return
    }
    selectTableauCard(index, card.id)
  }

  const hintSource = (location: Location, cardId: string): boolean =>
    hint?.type === 'move' && sameLocation(hint.move.from, location) && hint.move.cardId === cardId

  const hintDestination = (location: Location): boolean =>
    hint?.type === 'move' && sameLocation(hint.move.to, location)

  const hintDescription = (): string => {
    if (hint?.type === 'deal') return 'Draw from the stock.'
    if (hint?.type !== 'move') return hintMessage
    const card = hint.move.from.type === 'waste'
      ? getTopCard(state.waste)
      : hint.move.from.type === 'tableau'
        ? state.tableau[hint.move.from.index]?.find((item) => item.id === hint.move.cardId)
        : undefined
    const target = hint.move.to.type === 'tableau'
      ? `column ${hint.move.to.index + 1}`
      : hint.move.to.type === 'foundation'
        ? `foundation ${hint.move.to.index + 1}`
        : 'waste pile'
    return `Move ${describeSolitaireCard(card)} to ${target}.`
  }

  const selectedDescription = describeSelectedSolitaireCard(selected, state)
  const foundationGuides = foundationGuideSuits(state.foundations)
  const feedback = resolveFeedback({
    verbose: settings.solitaireVerboseFeedback,
    invalid: invalidMove,
    hasHint: Boolean(hint || hintMessage),
    selectedDescription,
    actionMessage,
    dragging: Boolean(dragging),
  })

  return (
    <div
      className={`zen-solitaire-table relative flex min-h-0 flex-col ${dragging ? 'zen-is-dragging' : ''} ${(settings.gamePieceScale === 'large') ? 'zen-large-cards' : ''} ${settings.reducedMotion ? 'motion-reduce' : ''}`}
      data-table-theme={settings.solitaireTableTheme}
      data-card-style={settings.solitaireCardStyle}
      data-card-faces={settings.solitaireCardFaces}
      data-card-back={settings.solitaireCardBack}
    >
      <GameToolbar className={`zen-solitaire-toolbar ${settings.handedness === 'left' ? 'zen-solitaire-toolbar--left' : ''}`}>
        <button type="button" onClick={requestNewGame} className="zen-game-button zen-solitaire-action">
          <ToolbarIcon name="new" /><span>New Game</span>
        </button>
        <button type="button" onClick={undoMove} disabled={state.history.length === 0} className="zen-game-button zen-solitaire-action">
          <ToolbarIcon name="undo" /><span>Undo</span>
        </button>
        <button type="button" onClick={showHint} className="zen-game-button zen-solitaire-action">
          <ToolbarIcon name="hint" /><span>Hint</span>
        </button>
        <button type="button" onClick={() => setActiveDialog('menu')} className="zen-game-button zen-solitaire-action" aria-haspopup="dialog" aria-expanded={activeDialog === 'menu'}>
          <ToolbarIcon name="menu" /><span>Menu</span>
        </button>
        <div className={`zen-solitaire-context ${feedback.mode !== 'stats' ? 'zen-solitaire-context--feedback' : ''}`}>
          {feedback.mode === 'invalid' ? (
            <>
              <span role="alert" className="zen-solitaire-context__text">That move is not allowed. Choose another pile.</span>
              {selected ? <button type="button" onClick={clearSelection}>Cancel</button> : null}
            </>
          ) : feedback.mode === 'hint' ? (
            <>
              <span role="status" className="zen-solitaire-context__text">{hintDescription()}</span>
              <button type="button" onClick={dismissHint}>Dismiss</button>
            </>
          ) : feedback.mode === 'selection' ? (
            <>
              <span role="status" className="zen-solitaire-context__text">{selectedDescription}</span>
              <button type="button" onClick={clearSelection}>Cancel</button>
            </>
          ) : feedback.mode === 'action' ? (
            <span role="status" className="zen-solitaire-context__text">{actionMessage}</span>
          ) : !settings.calmStats ? (
            <div className="zen-solitaire-stats">
              <span className="zen-game-stat">Moves {state.history.length}</span>
              {settings.timer ? <span className="zen-game-stat">Time {formatTime(elapsedSeconds)}</span> : null}
            </div>
          ) : null}
        </div>
      </GameToolbar>
      <div role="status" aria-live="polite" className="sr-only">
        {feedback.screenReaderOnly}
      </div>

      <p className="zen-zoom-scroll-note" role="note">At high zoom, scroll or swipe horizontally to reach every pile.</p>
      <div className="zen-card-row" role="region" aria-label="Stock, waste and foundations" aria-description="At high zoom, scroll horizontally to reach each pile.">
        <div className="zen-top-card-row">
          <div className="zen-top-card-group">
            <button
              type="button"
              onClick={deal}
              className={`zen-card-button ${hint?.type === 'deal' ? 'zen-hint-source' : ''}`}
              aria-label={`Stock, ${cardCount(state.stock.length)} remaining${gameDrawMode === 'three' ? ', draw three' : ', draw one'}`}
            >
              <CardView card={getTopCard(state.stock)} placeholder={state.stock.length === 0} largeCards={(settings.gamePieceScale === 'large')} animate={motionEnabled} cardFaces={settings.solitaireCardFaces} />
            </button>
            <button
              type="button"
              onClick={toggleWasteSelection}
              onDoubleClick={() => {
                const top = getTopCard(state.waste)
                if (top) attemptFoundationMove({ type: 'waste' }, top.id)
              }}
              className="zen-card-button"
              aria-label={`Waste pile, ${describeSolitaireCard(getTopCard(state.waste))}, ${cardCount(state.waste.length)}`}
              aria-pressed={selected?.location.type === 'waste'}
            >
              <CardView
                card={getTopCard(state.waste)}
                cardFaces={settings.solitaireCardFaces}
                placeholder={state.waste.length === 0}
                largeCards={(settings.gamePieceScale === 'large')}
                selected={selected?.location.type === 'waste'}
                hinted={hintSource({ type: 'waste' }, getTopCard(state.waste)?.id ?? '')}
                onDoubleClick={state.waste.length > 0 ? () => attemptFoundationMove({ type: 'waste' }, state.waste[state.waste.length - 1].id) : undefined}
                onPointerDown={state.waste.length > 0 ? (event) => {
                  const card = state.waste[state.waste.length - 1]
                  beginPointer({ type: 'waste' }, card.id, [card], event)
                } : undefined}
                onPointerMove={movePointer}
                onPointerUp={endPointer}
                onPointerCancel={cancelPointer}
                onLostPointerCapture={cancelPointer}
                ghosted={dragging?.location.type === 'waste'}
                animate={motionEnabled}
              />
            </button>
          </div>

          <div className="zen-foundation-grid">
            {state.foundations.map((pile, index) => (
              <button
                key={`f-${index}`}
                type="button"
                onClick={() => attemptMove({ type: 'foundation', index })}
                data-solitaire-drop={`foundation:${index}`}
                className={`zen-card-button ${dragging && dropHover?.type === 'foundation' && dropHover.index === index && canDrop({ type: 'foundation', index }) ? 'zen-drag-hover' : ''}`}
                aria-label={pile.length ? `Foundation ${getTopCard(pile)?.suit}, ${describeSolitaireCard(getTopCard(pile))}` : `Foundation column ${index + 1}, empty, accepts any Ace`}
              >
                <div className={`${(dragging || settings.solitaireShowPossibleMoves) && canDrop({ type: 'foundation', index }) ? 'zen-drop-target' : ''} ${hintDestination({ type: 'foundation', index }) ? 'zen-hint-destination' : ''}`}>
                  <CardView card={getTopCard(pile)} placeholder={pile.length === 0} placeholderKind="foundation" placeholderSuit={foundationGuides[index]} largeCards={(settings.gamePieceScale === 'large')} animate={motionEnabled} cardFaces={settings.solitaireCardFaces} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="zen-card-row" role="region" aria-label="Solitaire tableau" aria-description="Use Tab to reach each face-up card or empty column. At high zoom, scroll horizontally to reach every column.">
        <div className="zen-card-grid">
          {state.tableau.map((pile, index) => (
            <PileView
              key={`t-${index}`}
              cards={pile}
              columnIndex={index}
              ariaLabel={`Tableau column ${index + 1}, ${cardCount(pile.length)}, ${describeSolitaireCard(getTopCard(pile))}`}
              largeCards={(settings.gamePieceScale === 'large')}
              cardFaces={settings.solitaireCardFaces}
              selectedCardId={selected?.cardId}
              canDrop={dragging ? canDrop({ type: 'tableau', index }) : settings.solitaireShowPossibleMoves && canDrop({ type: 'tableau', index })}
              dragHover={!!dragging && dropHover?.type === 'tableau' && dropHover.index === index && canDrop({ type: 'tableau', index })}
              onEmptyClick={() => attemptMove({ type: 'tableau', index })}
              onPileClick={() => attemptMove({ type: 'tableau', index })}
              onCardPointerDown={(card, event) => {
                const cardIndex = pile.findIndex((item) => item.id === card.id)
                beginPointer({ type: 'tableau', index }, card.id, pile.slice(cardIndex), event)
              }}
              onCardPointerMove={movePointer}
              onCardPointerUp={endPointer}
              onCardPointerCancel={cancelPointer}
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

      {dragging ? createPortal((
        <div className="zen-drag-layer" style={{
          '--zen-card-width': `${dragging.width}px`,
          '--zen-card-height': `${dragging.height}px`,
          '--zen-faceup-step': dragging.step,
        } as CSSProperties}>
        <div
          className="absolute left-0 top-0"
          style={{
            transform: `translate3d(${dragging.x}px, ${dragging.y}px, 0)`,
          }}
        >
          <div className="relative drop-shadow-xl">
            {dragging.cards.map((card, index) => (
              <div key={card.id} className="absolute" style={{ top: `calc(${index} * var(--zen-faceup-step))`, zIndex: index }}>
                <CardView card={card} largeCards={(settings.gamePieceScale === 'large')} cardFaces={settings.solitaireCardFaces} />
              </div>
            ))}
            <div style={{ height: `calc(${dragging.cards.length - 1} * var(--zen-faceup-step) + var(--zen-card-height))` }} />
          </div>
        </div>
        </div>
      ), document.body) : null}

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

      {activeDialog === 'menu' ? (
        <GameDialog title="Solitaire menu" onDismiss={() => setActiveDialog(null)}>
          <div className="zen-solitaire-menu">
            <button type="button" onClick={() => setActiveDialog('rules')} className="zen-game-button">How to Play</button>
            <button type="button" onClick={() => setActiveDialog('appearance')} className="zen-game-button">Appearance</button>
            <button type="button" onClick={() => setActiveDialog('options')} className="zen-game-button">Game Options</button>
            {autoFinishPlan ? <button type="button" onClick={autoFinish} className="zen-game-button">Auto-finish cards</button> : null}
            {selected ? <button type="button" onClick={() => { clearSelection(); setActiveDialog(null) }} className="zen-game-button">Cancel selection</button> : null}
          </div>
          <button type="button" onClick={() => setActiveDialog(null)} className="zen-solitaire-dialog-close">Close menu</button>
        </GameDialog>
      ) : null}

      {activeDialog === 'rules' ? (
        <GameDialog title="How to Play" onDismiss={() => setActiveDialog(null)} focusHeading>
          <div className="zen-solitaire-dialog-content space-y-3 text-base leading-relaxed">
            <section><h3 className="font-bold">Goal</h3><p>Move all 52 cards to the four foundations, building each suit from Ace to King.</p></section>
            <section><h3 className="font-bold">Tableau</h3><p>Build columns down in alternating red and black. Move a face-up card or a correctly ordered face-up stack. Only a King may start an empty column.</p></section>
            <section><h3 className="font-bold">Foundations</h3><p>Build each foundation up by suit, starting with an Ace. Empty suit symbols show suits still needed; any Ace may start any empty foundation.</p></section>
            <section><h3 className="font-bold">Stock and waste</h3><p>Tap the stock to draw {gameDrawMode === 'three' ? 'up to three cards' : 'one card'}. When it is empty, tap it again to turn the waste back over.</p></section>
            <section><h3 className="font-bold">Controls</h3><p>Tap a card or stack, then tap a destination. With a keyboard, use Tab to reach a card or pile and Enter or Space to select it and a destination. Select it again to cancel. Double-tap a suitable card to send it to a foundation. Use Undo to take back your last move or stock action.</p></section>
          </div>
          <button type="button" onClick={() => setActiveDialog(null)} className="zen-game-button">Close How to Play</button>
        </GameDialog>
      ) : null}

      {activeDialog === 'appearance' ? (
        <GameDialog title="Appearance" onDismiss={() => setActiveDialog(null)}>
          <div className="space-y-3">
            <div className="zen-appearance-controls">
              <label>Table colour
                <select value={settings.solitaireTableTheme} onChange={(event) => onSettingChange('solitaireTableTheme', event.target.value as SolitaireTableTheme)}>
                  <option value="classic-green">Classic Green</option>
                  <option value="midnight-blue">Midnight Blue</option>
                  <option value="burgundy">Burgundy</option>
                </select>
              </label>
              <label>Card style
                <select value={settings.solitaireCardStyle} onChange={(event) => onSettingChange('solitaireCardStyle', event.target.value as SolitaireCardStyle)}>
                  <option value="classic">Classic</option>
                  <option value="large-print">Large Print</option>
                </select>
              </label>
              <label>Card faces
                <select value={settings.solitaireCardFaces} onChange={(event) => onSettingChange('solitaireCardFaces', event.target.value as SolitaireCardFaces)}>
                  <option value="simplified">Simplified</option>
                  <option value="traditional">Traditional</option>
                </select>
              </label>
              <label>Card back
                <select value={settings.solitaireCardBack} onChange={(event) => onSettingChange('solitaireCardBack', event.target.value as SolitaireCardBack)}>
                  <option value="classic-blue">Classic Blue</option>
                  <option value="traditional-red">Traditional Red</option>
                  <option value="high-contrast">Simple High Contrast</option>
                </select>
              </label>
            </div>
            <div
              className="zen-appearance-preview"
              data-table-theme={settings.solitaireTableTheme}
              data-card-style={settings.solitaireCardStyle}
              data-card-faces={settings.solitaireCardFaces}
              data-card-back={settings.solitaireCardBack}
              role="img"
              aria-label="Preview of Queen of Hearts, 10 of Spades and selected card back"
            >
              <CardView card={{ id: 'preview-queen', rank: 'Q', suit: 'hearts', faceUp: true }} cardFaces={settings.solitaireCardFaces} />
              <CardView card={{ id: 'preview-ten', rank: '10', suit: 'spades', faceUp: true }} cardFaces={settings.solitaireCardFaces} />
              <CardView card={{ id: 'preview-back', rank: 'A', suit: 'clubs', faceUp: false }} />
            </div>
            <p className="text-sm">Changes apply immediately and are saved on this device. High contrast is in Settings.</p>
          </div>
          <button type="button" onClick={() => setActiveDialog(null)} className="zen-game-button">Close Appearance</button>
        </GameDialog>
      ) : null}

      {activeDialog === 'options' ? (
        <GameDialog title="Game Options" onDismiss={() => setActiveDialog(null)}>
          <div className="space-y-3">
            <fieldset className="space-y-2">
              <legend className="font-semibold">Cards drawn from stock in new games</legend>
              <div className="zen-solitaire-option-choices">
                <button type="button" aria-pressed={settings.drawMode === 'one'} onClick={() => onSettingChange('drawMode', 'one')} className={`zen-choice-button ${settings.drawMode === 'one' ? 'is-selected' : ''}`}>Draw one</button>
                <button type="button" aria-pressed={settings.drawMode === 'three'} onClick={() => onSettingChange('drawMode', 'three')} className={`zen-choice-button ${settings.drawMode === 'three' ? 'is-selected' : ''}`}>Draw three</button>
              </div>
              <p className="text-sm">This game uses draw {gameDrawMode === 'three' ? 'three' : 'one'}. A new choice applies when you start a new game.</p>
            </fieldset>
            <div>
              <label className="zen-toggle-row"><span>Verbose feedback: {settings.solitaireVerboseFeedback ? 'On' : 'Off'}</span><input type="checkbox" checked={settings.solitaireVerboseFeedback} onChange={(event) => onSettingChange('solitaireVerboseFeedback', event.target.checked)} /></label>
              <p className="text-sm">Show card selections and completed actions in the toolbar. Screen-reader announcements remain on when this is off.</p>
            </div>
            <div>
              <label className="zen-toggle-row"><span>Show possible moves: {settings.solitaireShowPossibleMoves ? 'On' : 'Off'}</span><input type="checkbox" checked={settings.solitaireShowPossibleMoves} onChange={(event) => onSettingChange('solitaireShowPossibleMoves', event.target.checked)} /></label>
              <p className="text-sm">Outline legal destinations after selecting a card. The Hint button works separately.</p>
            </div>
            {settings.simpleMode ? <p>Simple Mode hides move counts and statistics. Change Simple Mode in Settings.</p> : (
              <>
                <label className="zen-toggle-row">Show timer<input type="checkbox" checked={settings.timer} onChange={(event) => onSettingChange('timer', event.target.checked)} /></label>
                <label className="zen-toggle-row">Hide move and time counts<input type="checkbox" checked={settings.calmStats} onChange={(event) => onSettingChange('calmStats', event.target.checked)} /></label>
                <section aria-labelledby="solitaire-statistics-title">
                  <h3 id="solitaire-statistics-title" className="font-semibold">Statistics</h3>
                  {statistics ? <p>{statistics.gamesStarted} games started · {statistics.gamesCompleted} completed · {statistics.totalMoves} moves in completed games{statistics.bestMoves === null ? '' : ` · best ${statistics.bestMoves} moves`}</p> : <p>Statistics are stored on this device.</p>}
                </section>
              </>
            )}
          </div>
          <button type="button" onClick={() => setActiveDialog(null)} className="zen-game-button">Close Game Options</button>
        </GameDialog>
      ) : null}
    </div>
  )
}
