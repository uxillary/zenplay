import { PAIR_FACES, PAIRS_PER_BOARD_SIZE, type PairCard, type PairsBoardSize, type PairsState } from './types.ts'

export type RevealResult = 'first' | 'match' | 'mismatch' | 'ignored'

const shuffled = <T,>(items: T[], random: () => number): T[] => {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomValue = random()
    const safeValue = Number.isFinite(randomValue) ? Math.max(0, Math.min(0.999999999, randomValue)) : 0
    const swapIndex = Math.floor(safeValue * (index + 1))
    ;[items[index], items[swapIndex]] = [items[swapIndex], items[index]]
  }
  return items
}

export const createPairsState = (boardSize: PairsBoardSize, random: () => number = Math.random): PairsState => {
  const pairIds = PAIR_FACES.slice(0, PAIRS_PER_BOARD_SIZE[boardSize]).map(({ id }) => id)
  const cards: PairCard[] = shuffled(pairIds.flatMap((pairId) => [
    { id: `${pairId}-a`, pairId },
    { id: `${pairId}-b`, pairId },
  ]), random)
  return { boardSize, cards, revealedCardIds: [], matchedPairIds: [], turns: 0 }
}

export const revealPairCard = (state: PairsState, cardId: string): { state: PairsState; result: RevealResult } => {
  const card = state.cards.find((item) => item.id === cardId)
  if (!card || state.matchedPairIds.includes(card.pairId) || state.revealedCardIds.includes(cardId) || state.revealedCardIds.length >= 2) {
    return { state, result: 'ignored' }
  }
  if (state.revealedCardIds.length === 0) {
    return { state: { ...state, revealedCardIds: [cardId] }, result: 'first' }
  }

  const firstCard = state.cards.find((item) => item.id === state.revealedCardIds[0])
  const nextTurns = state.turns + 1
  if (firstCard?.pairId === card.pairId) {
    return {
      state: {
        ...state,
        revealedCardIds: [],
        matchedPairIds: [...state.matchedPairIds, card.pairId],
        turns: nextTurns,
      },
      result: 'match',
    }
  }
  return {
    state: { ...state, revealedCardIds: [...state.revealedCardIds, cardId], turns: nextTurns },
    result: 'mismatch',
  }
}

export const hideMismatchedCards = (state: PairsState): PairsState =>
  state.revealedCardIds.length === 2
    && state.cards.find((card) => card.id === state.revealedCardIds[0])?.pairId !== state.cards.find((card) => card.id === state.revealedCardIds[1])?.pairId
    ? { ...state, revealedCardIds: [] }
    : state

export const getHintCardId = (state: PairsState): string | null => {
  const firstRevealed = state.cards.find((card) => card.id === state.revealedCardIds[0])
  const unmatched = state.cards.filter((card) =>
    !state.matchedPairIds.includes(card.pairId) && !state.revealedCardIds.includes(card.id),
  )
  return (firstRevealed ? unmatched.find((card) => card.pairId === firstRevealed.pairId) : unmatched[0])?.id ?? null
}

export const isPairsComplete = (state: PairsState): boolean =>
  state.matchedPairIds.length === PAIRS_PER_BOARD_SIZE[state.boardSize]
