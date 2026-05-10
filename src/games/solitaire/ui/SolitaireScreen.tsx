import { useEffect, useMemo, useReducer, useState } from 'react'
import type { AppSettings } from '../../../lib/settings'
import { applyMove, dealFromStock, undo } from '../model/engine'
import { createInitialState } from '../model/deal'
import { findObviousMoves, getTopCard, isValidMove, isWin, sameLocation } from '../model/rules'
import type { Location, Move, SolitaireState } from '../model/types'
import { CardView } from './CardView'
import { PileView } from './PileView'

type Props = {
  settings: AppSettings
}

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

  const startWasteDrag = () => {
    if (state.waste.length === 0) return
    const card = state.waste[state.waste.length - 1]
    setSelected({ location: { type: 'waste' }, cardId: card.id })
    setInvalidMove(false)
  }

  const startTableauDrag = (index: number, cardId: string) => {
    setSelected({ location: { type: 'tableau', index }, cardId })
    setInvalidMove(false)
  }

  const attemptMove = (to: Location) => {
    if (!selected) return
    const move: Move = { from: selected.location, to, cardId: selected.cardId }
    if (isValidMove(state, move)) {
      dispatch({ type: 'move', move })
      recordMove()
      clearSelection()
      return
    }
    setInvalidMove(true)
    setTimeout(() => setInvalidMove(false), 600)
  }

  const deal = () => {
    dispatch({ type: 'deal' })
    recordMove()
  }

  const checkObviousMoves = () => {
    setShowNoObviousMoves(findObviousMoves(state).length === 0)
  }

  return (
    <div className={`flex h-full flex-col gap-3 ${settings.reducedMotion ? 'motion-reduce' : ''}`}>
      <div className={`flex flex-wrap items-center gap-2 ${settings.handedness === 'left' ? 'order-2' : ''}`}>
        <button type="button" onClick={startNewGame} className="min-h-12 rounded-xl bg-zinc-700 px-5 text-lg">
          New Game
        </button>
        <button type="button" onClick={undoMove} className="min-h-12 rounded-xl bg-zinc-700 px-5 text-lg">
          Undo
        </button>
        <button type="button" onClick={checkObviousMoves} className="min-h-12 rounded-xl bg-zinc-700 px-5 text-lg">
          Check moves
        </button>
        {!settings.calmStats ? (
          <div className="ml-auto flex gap-2 text-sm">
            <span className="rounded-full border border-zinc-500/60 bg-zinc-800/70 px-3 py-2">Moves {moves}</span>
            {settings.timer ? (
              <span className="rounded-full border border-zinc-500/60 bg-zinc-800/70 px-3 py-2">Time {formatTime(elapsedSeconds)}</span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-7 gap-3">
        <div className="col-span-2 flex gap-3">
          <button type="button" onClick={deal} className="rounded-xl" aria-label="Deal from stock">
            <CardView card={getTopCard(state.stock)} placeholder={state.stock.length === 0} largeCards={settings.largeCards} />
          </button>
          <button
            type="button"
            onClick={toggleWasteSelection}
            className="rounded-xl"
          >
            <CardView
              card={getTopCard(state.waste)}
              placeholder={state.waste.length === 0}
              largeCards={settings.largeCards}
              selected={selected?.location.type === 'waste'}
              onDragStart={state.waste.length > 0 ? startWasteDrag : undefined}
            />
          </button>
        </div>

        <div className="col-span-5 grid grid-cols-4 gap-3">
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
              className="rounded-xl"
            >
              <div className={canDrop({ type: 'foundation', index }) ? 'rounded-xl ring-2 ring-sky-500' : ''}>
                <CardView card={getTopCard(pile)} placeholder={pile.length === 0} largeCards={settings.largeCards} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 overflow-hidden">
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
            onCardDragStart={(card) => startTableauDrag(index, card.id)}
            onCardClick={(card) => {
              if (!card.faceUp) return
              selectTableauCard(index, card.id)
            }}
          />
        ))}
      </div>

      <div
        aria-hidden
        className={`h-2 w-16 rounded-full bg-sky-400/40 ${invalidMove && !settings.reducedMotion ? 'animate-pulse' : 'opacity-0'}`}
      />

      {showNoObviousMoves ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-sky-400/30 bg-sky-950/30 p-3 text-sm text-sky-100">
          <span>No obvious moves found.</span>
          <button type="button" onClick={undoMove} className="rounded-lg bg-zinc-700 px-3 py-2">
            Undo
          </button>
          <button type="button" onClick={startNewGame} className="rounded-lg bg-zinc-700 px-3 py-2">
            New Game
          </button>
        </div>
      ) : null}

      {isWin(state) ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/45">
          <div className="w-72 rounded-2xl bg-zinc-900 p-6 text-center">
            <p className="mb-4 text-2xl">You did it.</p>
            <button type="button" onClick={startNewGame} className="min-h-12 rounded-xl bg-zinc-700 px-4 text-lg">
              New Game
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
