import { useMemo, useReducer, useState } from 'react'
import type { AppSettings } from '../../../lib/settings'
import { applyMove, dealFromStock, undo } from '../model/engine'
import { createInitialState } from '../model/deal'
import { getTopCard, isValidMove, isWin } from '../model/rules'
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

  const canDrop = (target: Location): boolean => destinations.some((d) => JSON.stringify(d) === JSON.stringify(target))

  const attemptMove = (to: Location) => {
    if (!selected) return
    const move: Move = { from: selected.location, to, cardId: selected.cardId }
    if (isValidMove(state, move)) {
      dispatch({ type: 'move', move })
      setSelected(null)
      setInvalidMove(false)
      return
    }
    setInvalidMove(true)
    setTimeout(() => setInvalidMove(false), 600)
  }

  return (
    <div className={`flex h-full flex-col gap-3 ${settings.reducedMotion ? 'motion-reduce' : ''}`}>
      <div className={`flex gap-2 ${settings.handedness === 'left' ? 'order-2' : ''}`}>
        <button type="button" onClick={() => dispatch({ type: 'new' })} className="min-h-12 rounded-xl bg-zinc-700 px-5 text-lg">
          New Game
        </button>
        <button type="button" onClick={() => dispatch({ type: 'undo' })} className="min-h-12 rounded-xl bg-zinc-700 px-5 text-lg">
          Undo
        </button>
      </div>

      <div className="grid grid-cols-7 gap-3">
        <div className="col-span-2 flex gap-3">
          <button type="button" onClick={() => dispatch({ type: 'deal' })} className="rounded-xl" aria-label="Deal from stock">
            <CardView card={getTopCard(state.stock)} placeholder={state.stock.length === 0} largeCards={settings.largeCards} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (state.waste.length) {
                const card = state.waste[state.waste.length - 1]
                setSelected({ location: { type: 'waste' }, cardId: card.id })
              }
            }}
            className="rounded-xl"
          >
            <CardView
              card={getTopCard(state.waste)}
              placeholder={state.waste.length === 0}
              largeCards={settings.largeCards}
              selected={selected?.location.type === 'waste'}
            />
          </button>
        </div>

        <div className="col-span-5 grid grid-cols-4 gap-3">
          {state.foundations.map((pile, index) => (
            <button
              key={`f-${index}`}
              type="button"
              onClick={() => attemptMove({ type: 'foundation', index })}
              className={canDrop({ type: 'foundation', index }) ? 'rounded-xl ring-2 ring-sky-500' : 'rounded-xl'}
            >
              <CardView card={getTopCard(pile)} placeholder={pile.length === 0} largeCards={settings.largeCards} />
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
            onCardClick={(card) => {
              if (!card.faceUp) return
              if (selected) {
                attemptMove({ type: 'tableau', index })
                return
              }
              setSelected({ location: { type: 'tableau', index }, cardId: card.id })
            }}
          />
        ))}
      </div>

      {invalidMove ? <p className="rounded-xl bg-amber-700/35 p-3 text-sm">That move is not allowed.</p> : null}

      {isWin(state) ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/45">
          <div className="w-72 rounded-2xl bg-zinc-900 p-6 text-center">
            <p className="mb-4 text-2xl">You did it.</p>
            <button type="button" onClick={() => dispatch({ type: 'new' })} className="min-h-12 rounded-xl bg-zinc-700 px-4 text-lg">
              New Game
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
