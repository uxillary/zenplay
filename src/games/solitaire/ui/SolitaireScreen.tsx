import { useEffect, useMemo, useReducer, useState, type DragEvent } from 'react'
import type { AppSettings } from '../../../lib/settings'
import { applyMove, dealFromStock, undo } from '../model/engine'
import { createInitialState } from '../model/deal'
import { canAutoComplete, findAutoCompleteMove, findFoundationMove, findObviousMoves, getTopCard, isValidMove, isWin, sameLocation } from '../model/rules'
import type { Card, Location, Move, SolitaireState } from '../model/types'
import { CardView } from './CardView'
import { PileView } from './PileView'

type Props = {
  settings: AppSettings
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
  | { type: 'deal' }
  | { type: 'undo' }
  | { type: 'new' }

const reducer = (state: SolitaireState, action: Action): SolitaireState => {
  if (action.type === 'move') return applyMove(state, action.move)
  if (action.type === 'deal') return dealFromStock(state)
  if (action.type === 'undo') return undo(state)
  if (action.type === 'new') return createInitialState()
  return state
}

export const SolitaireScreen = ({ settings }: Props) => {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const [selected, setSelected] = useState<{ location: Location; cardId: string } | null>(null)
  const [invalidMove, setInvalidMove] = useState(false)
  const [moves, setMoves] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [showNoObviousMoves, setShowNoObviousMoves] = useState(false)
  const [dragging, setDragging] = useState<DragState>(null)
  const motionEnabled = !settings.reducedMotion
  const autoCompleteMove = useMemo(() => findAutoCompleteMove(state), [state])

  useEffect(() => {
    if (!settings.timer || settings.calmStats || isWin(state)) return undefined
    const intervalId = window.setInterval(() => setElapsedSeconds((current) => current + 1), 1000)
    return () => window.clearInterval(intervalId)
  }, [settings.calmStats, settings.timer, state])

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

  const recordMove = () => {
    setMoves((current) => current + 1)
    setShowNoObviousMoves(false)
  }

  const startNewGame = () => {
    dispatch({ type: 'new' })
    setMoves(0)
    setElapsedSeconds(0)
    setShowNoObviousMoves(false)
    clearSelection()
  }

  const undoMove = () => {
    dispatch({ type: 'undo' })
    setMoves((current) => Math.max(0, current - 1))
    setShowNoObviousMoves(false)
    clearSelection()
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
      return
    }
    setSelected({ location: { type: 'waste' }, cardId: card.id })
    setInvalidMove(false)
  }

  const selectTableauCard = (index: number, cardId: string) => {
    if (selected?.location.type === 'tableau' && selected.location.index === index && selected.cardId === cardId) {
      clearSelection()
      return
    }
    setSelected({ location: { type: 'tableau', index }, cardId })
    setInvalidMove(false)
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
    recordMove()
    clearSelection()
    return true
  }

  const attemptFoundationMove = (location: Location, cardId: string) => {
    const move = findFoundationMove(state, location, cardId)
    if (move) {
      applyLegalMove(move)
    }
  }

  const autoCompleteOnce = () => {
    let nextState = state
    let completedMoves = 0
    let nextMove = findAutoCompleteMove(nextState)

    while (nextMove) {
      dispatch({ type: 'move', move: nextMove })
      nextState = applyMove(nextState, nextMove)
      completedMoves += 1
      nextMove = findAutoCompleteMove(nextState)
    }

    if (completedMoves > 0) {
      setMoves((current) => current + completedMoves)
      setShowNoObviousMoves(false)
      clearSelection()
    }
  }

  const deal = () => {
    dispatch({ type: 'deal' })
    recordMove()
  }

  const checkObviousMoves = () => {
    setShowNoObviousMoves(findObviousMoves(state).length === 0)
  }

  return (
    <div className={`zen-solitaire-table flex h-full flex-col gap-4 ${settings.reducedMotion ? 'motion-reduce' : ''}`}>
      <div className={`flex flex-wrap items-center gap-2 ${settings.handedness === 'left' ? 'order-2' : ''}`}>
        <button type="button" onClick={startNewGame} className="zen-game-button">
          New Game
        </button>
        <button type="button" onClick={undoMove} className="zen-game-button">
          Undo
        </button>
        <button type="button" onClick={checkObviousMoves} className="zen-game-button">
          Hint
        </button>
        {canAutoComplete(state) && autoCompleteMove ? (
          <button type="button" onClick={autoCompleteOnce} className="zen-game-button">
            Auto-complete
          </button>
        ) : null}
        {!settings.calmStats ? (
          <div className="ml-auto flex flex-wrap gap-x-4 gap-y-1 text-lg font-semibold text-white">
            <span className="zen-game-stat">Moves {moves}</span>
            {settings.timer ? (
              <span className="zen-game-stat">Time {formatTime(elapsedSeconds)}</span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="zen-card-row grid grid-cols-7 gap-1 md:gap-3">
        <div className="col-span-2 flex gap-1 md:gap-3">
          <button type="button" onClick={deal} className="zen-card-button" aria-label="Deal from stock">
            <CardView card={getTopCard(state.stock)} placeholder={state.stock.length === 0} largeCards={settings.largeCards} animate={motionEnabled} />
          </button>
          <button
            type="button"
            onClick={toggleWasteSelection}
            className="zen-card-button"
          >
            <CardView
              card={getTopCard(state.waste)}
              placeholder={state.waste.length === 0}
              largeCards={settings.largeCards}
              selected={selected?.location.type === 'waste'}
              onDoubleClick={state.waste.length > 0 ? () => attemptFoundationMove({ type: 'waste' }, state.waste[state.waste.length - 1].id) : undefined}
              onDragStart={state.waste.length > 0 ? startWasteDrag : undefined}
              onDrag={updateDragPosition}
              onDragEnd={stopDragging}
              ghosted={dragging?.location.type === 'waste'}
              animate={motionEnabled}
            />
          </button>
        </div>

        <div className="col-span-5 grid grid-cols-4 gap-1 md:gap-3">
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
            >
              <div className={canDrop({ type: 'foundation', index }) ? 'zen-drop-target' : ''}>
                <CardView card={getTopCard(pile)} placeholder={pile.length === 0} largeCards={settings.largeCards} animate={motionEnabled} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="zen-card-row grid grid-cols-7 gap-1 md:gap-3">
        {state.tableau.map((pile, index) => (
          <PileView
            key={`t-${index}`}
            cards={pile}
            largeCards={settings.largeCards}
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
            motionEnabled={motionEnabled}
            onCardClick={(card) => {
              if (!card.faceUp) return
              selectTableauCard(index, card.id)
            }}
          />
        ))}
      </div>

      <div
        aria-hidden
        className={`h-2 w-16 rounded-full bg-white/70 ${invalidMove && motionEnabled ? 'opacity-100' : 'opacity-0'}`}
      />

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
              <div key={card.id} className="absolute" style={{ top: `${index * (settings.largeCards ? 56 : 48)}px` }}>
                <CardView card={card} largeCards={settings.largeCards} />
              </div>
            ))}
            <div style={{ height: `${(dragging.cards.length - 1) * (settings.largeCards ? 56 : 48) + (settings.largeCards ? 128 : 112)}px` }} />
          </div>
        </div>
      ) : null}

      {showNoObviousMoves ? (
        <div className="zen-game-message flex flex-wrap items-center gap-2">
          <span>No more moves.</span>
          <button type="button" onClick={undoMove} className="zen-game-button zen-game-button--small">
            Undo
          </button>
          <button type="button" onClick={startNewGame} className="zen-game-button zen-game-button--small">
            New Game
          </button>
        </div>
      ) : null}

      {isWin(state) ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/45">
          <div className="w-72 rounded-lg bg-white p-6 text-center text-zinc-950 shadow-xl">
            <p className="mb-4 text-2xl font-semibold">Well done</p>
            <button type="button" onClick={startNewGame} className="zen-game-button">
              New Game
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
