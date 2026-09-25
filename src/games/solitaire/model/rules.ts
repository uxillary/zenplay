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
  if (sameLocation(move.from, move.to)) return false
  if (move.from.type === 'tableau' && !state.tableau[move.from.index]) return false
  if (move.to.type === 'tableau' && !state.tableau[move.to.index]) return false
  if (move.to.type === 'foundation' && !state.foundations[move.to.index]) return false

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
    if (!top) {
      const suitAlreadyStarted = state.foundations.some((pile) => getTopCard(pile)?.suit === card.suit)
      return card.rank === 'A' && !suitAlreadyStarted
    }
    return card.suit === top.suit && rankIndex(card.rank) - rankIndex(top.rank) === 1
  }

  return false
}

export const isWin = (state: SolitaireState): boolean => {
  if (state.foundations.length !== 4 || state.foundations.some((pile) => pile.length !== 13)) return false
  const suits = new Set(state.foundations.map((pile) => getTopCard(pile)?.suit))
  if (suits.size !== 4) return false
  return state.foundations.every((pile) =>
    pile.every((card, index) => card.suit === pile[0]?.suit && card.rank === RANKS[index]),
  )
}

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

export const getAutoFinishPlan = (state: SolitaireState): Move[] | null => {
  if (state.stock.length > 0 || state.waste.length > 0 || state.tableau.some((pile) => pile.some((card) => !card.faceUp))) return null

  const tableau = state.tableau.map((pile) => [...pile])
  const foundations = state.foundations.map((pile) => [...pile])
  const plan: Move[] = []
  let remainingCards = tableau.reduce((total, pile) => total + pile.length, 0)

  while (remainingCards > 0) {
    const current: SolitaireState = { ...state, tableau, foundations, stock: [], waste: [] }
    if (findObviousMoves(current).some((move) => move.to.type === 'tableau')) return null

    const nextMove = tableau.flatMap((pile, index) => {
      const card = getTopCard(pile)
      if (!card) return []
      const move = findFoundationMove(current, { type: 'tableau', index }, card.id)
      return move ? [move] : []
    })[0]

    if (!nextMove || nextMove.to.type !== 'foundation') return null
    const card = tableau[nextMove.from.type === 'tableau' ? nextMove.from.index : -1]?.pop()
    const foundation = foundations[nextMove.to.index]
    if (!card || !foundation) return null
    foundation.push(card)
    plan.push(nextMove)
    remainingCards -= 1
  }

  return plan.length > 0 ? plan : null
}

export const canAutoComplete = (state: SolitaireState): boolean => getAutoFinishPlan(state) !== null

export const findAutoCompleteMove = (state: SolitaireState): Move | null => getAutoFinishPlan(state)?.[0] ?? null

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

export type SolitaireHint = { type: 'move'; move: Move } | { type: 'deal' }

export const findHint = (state: SolitaireState): SolitaireHint | null => {
  const tableauTargets = state.tableau.map((_, index) => ({ type: 'tableau', index }) as Location)

  for (let index = 0; index < state.tableau.length; index += 1) {
    const pile = state.tableau[index]
    const firstFaceUp = pile.findIndex((card) => card.faceUp)
    if (firstFaceUp <= 0 || pile[firstFaceUp - 1]?.faceUp) continue
    const card = pile[firstFaceUp]
    const move = tableauTargets
      .filter((target) => target.type === 'tableau' && target.index !== index)
      .map((to) => ({ from: { type: 'tableau', index } as Location, to, cardId: card.id }))
      .find((candidate) => isValidMove(state, candidate))
    if (move) return { type: 'move', move }
  }

  const wasteTop = getTopCard(state.waste)
  if (wasteTop) {
    const move = findFoundationMove(state, { type: 'waste' }, wasteTop.id)
    if (move) return { type: 'move', move }
  }

  for (let index = 0; index < state.tableau.length; index += 1) {
    const card = getTopCard(state.tableau[index])
    if (!card?.faceUp) continue
    const move = findFoundationMove(state, { type: 'tableau', index }, card.id)
    if (move) return { type: 'move', move }
  }

  const tableauMove = findObviousMoves(state).find((move) => move.to.type === 'tableau')
  if (tableauMove) return { type: 'move', move: tableauMove }
  if (state.stock.length > 0 || state.waste.length > 0) return { type: 'deal' }
  return null
}
