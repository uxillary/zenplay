import { RANKS, type Card, type Location, type Move, type SolitaireState } from './types.ts'

const isRed = (suit: Card['suit']) => suit === 'hearts' || suit === 'diamonds'

const rankIndex = (rank: Card['rank']) => RANKS.indexOf(rank)

const topFaceUpSlice = (pile: Card[], cardId: string): Card[] => {
  const idx = pile.findIndex((card) => card.id === cardId)
  if (idx < 0) return []
  const slice = pile.slice(idx)
  return slice.every((card) => card.faceUp) ? slice : []
}

export const getTopCard = (pile: Card[]): Card | undefined => pile[pile.length - 1]

export const sameLocation = (a: Location, b: Location): boolean => {
  if (a.type !== b.type) return false
  if (a.type === 'waste' || b.type === 'waste') return true
  return a.index === b.index
}

export const isValidMove = (state: SolitaireState, move: Move): boolean => {
  const sourceCards =
    move.from.type === 'tableau'
      ? topFaceUpSlice(state.tableau[move.from.index], move.cardId)
      : move.from.type === 'waste'
        ? state.waste[state.waste.length - 1]?.id === move.cardId
          ? [state.waste[state.waste.length - 1]]
          : []
        : []

  if (!sourceCards.length) return false

  if (move.to.type === 'tableau') {
    const dest = state.tableau[move.to.index]
    const first = sourceCards[0]
    const top = getTopCard(dest)
    if (!top) return first.rank === 'K'
    return top.faceUp && isRed(top.suit) !== isRed(first.suit) && rankIndex(top.rank) - rankIndex(first.rank) === 1
  }

  if (move.to.type === 'foundation') {
    if (sourceCards.length !== 1) return false
    const card = sourceCards[0]
    const dest = state.foundations[move.to.index]
    const top = getTopCard(dest)
    if (!top) return card.rank === 'A'
    return card.suit === top.suit && rankIndex(card.rank) - rankIndex(top.rank) === 1
  }

  return false
}

export const isWin = (state: SolitaireState): boolean => state.foundations.every((pile) => pile.length === 13)

export const findFoundationMove = (state: SolitaireState, from: Location, cardId: string): Move | null => {
  const moves = state.foundations
    .map((_, index) => ({ from, to: { type: 'foundation', index } as Location, cardId }))
    .filter((move) => isValidMove(state, move))

  if (moves.length > 0) {
    const card =
      from.type === 'tableau'
        ? state.tableau[from.index].find((tableauCard) => tableauCard.id === cardId)
        : from.type === 'waste'
          ? getTopCard(state.waste)
          : undefined

    if (card?.rank === 'A') return moves[0]
  }

  return moves.length === 1 ? moves[0] : null
}

export const canAutoComplete = (state: SolitaireState): boolean =>
  state.stock.length === 0 && state.waste.length === 0 && state.tableau.every((pile) => pile.every((card) => card.faceUp))

export const findAutoCompleteMove = (state: SolitaireState): Move | null => {
  if (!canAutoComplete(state)) return null

  const moves = state.tableau.flatMap((pile, index) => {
    const card = getTopCard(pile)
    if (!card || !card.faceUp) return []
    const move = findFoundationMove(state, { type: 'tableau', index }, card.id)
    return move ? [move] : []
  })

  return moves.length > 0 ? moves[0] : null
}

export const findObviousMoves = (state: SolitaireState): Move[] => {
  const sources: Array<{ location: Location; cardId: string }> = []
  const destinations: Location[] = [
    ...state.tableau.map((_, index) => ({ type: 'tableau', index }) as Location),
    ...state.foundations.map((_, index) => ({ type: 'foundation', index }) as Location),
  ]
  const wasteTop = getTopCard(state.waste)

  if (wasteTop) {
    sources.push({ location: { type: 'waste' }, cardId: wasteTop.id })
  }

  state.tableau.forEach((pile, index) => {
    pile.forEach((card) => {
      if (card.faceUp) {
        sources.push({ location: { type: 'tableau', index }, cardId: card.id })
      }
    })
  })

  return sources.flatMap((source) =>
    destinations
      .filter((destination) => !sameLocation(source.location, destination))
      .map((destination) => ({ from: source.location, to: destination, cardId: source.cardId }))
      .filter((move) => isValidMove(state, move)),
  )
}
