import type { Card, Move, SolitaireState } from './types.ts'
import { isValidMove } from './rules.ts'

const cloneWithoutHistory = (state: SolitaireState): Omit<SolitaireState, 'history'> => ({
  tableau: state.tableau.map((pile) => pile.map((card) => ({ ...card }))),
  foundations: state.foundations.map((pile) => pile.map((card) => ({ ...card }))),
  stock: state.stock.map((card) => ({ ...card })),
  waste: state.waste.map((card) => ({ ...card })),
})

const revealTableauTop = (tableau: Card[][], index: number): void => {
  const top = tableau[index][tableau[index].length - 1]
  if (top && !top.faceUp) {
    top.faceUp = true
  }
}

export const applyMove = (state: SolitaireState, move: Move): SolitaireState => {
  if (!isValidMove(state, move)) return state

  const snapshot = cloneWithoutHistory(state)
  const next = cloneWithoutHistory(state)

  let movingCards: Card[] = []
  if (move.from.type === 'tableau') {
    const fromPile = next.tableau[move.from.index]
    const idx = fromPile.findIndex((card) => card.id === move.cardId)
    movingCards = fromPile.splice(idx)
    revealTableauTop(next.tableau, move.from.index)
  } else if (move.from.type === 'waste') {
    const top = next.waste.pop()
    if (top) movingCards = [top]
  }

  if (move.to.type === 'tableau') {
    next.tableau[move.to.index].push(...movingCards)
  } else if (move.to.type === 'foundation') {
    next.foundations[move.to.index].push(...movingCards)
  }

  return { ...next, history: [...state.history, snapshot] }
}

export const dealFromStock = (state: SolitaireState): SolitaireState => {
  const snapshot = cloneWithoutHistory(state)
  const next = cloneWithoutHistory(state)

  if (next.stock.length === 0) {
    next.stock = next.waste.reverse().map((card) => ({ ...card, faceUp: false }))
    next.waste = []
  } else {
    const card = next.stock.pop()
    if (card) next.waste.push({ ...card, faceUp: true })
  }

  return { ...next, history: [...state.history, snapshot] }
}

export const undo = (state: SolitaireState): SolitaireState => {
  const previous = state.history[state.history.length - 1]
  if (!previous) return state
  return {
    ...previous,
    history: state.history.slice(0, -1),
  }
}
