import { PAIR_FACES, PAIRS_BOARD_SIZES, PAIRS_PER_BOARD_SIZE, type PairFaceId, type PairsState } from './types.ts'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const faceIds = new Set<string>(PAIR_FACES.map(({ id }) => id))
const isFaceId = (value: unknown): value is PairFaceId => typeof value === 'string' && faceIds.has(value)

export const isPairsState = (value: unknown): value is PairsState => {
  if (!isRecord(value) || !PAIRS_BOARD_SIZES.includes(value.boardSize as PairsState['boardSize'])) return false
  const boardSize = value.boardSize as PairsState['boardSize']
  const pairCount = PAIRS_PER_BOARD_SIZE[boardSize]
  if (!Array.isArray(value.cards) || value.cards.length !== pairCount * 2) return false
  if (!value.cards.every((card) =>
    isRecord(card)
    && isFaceId(card.pairId)
    && (card.id === `${card.pairId}-a` || card.id === `${card.pairId}-b`),
  )) return false

  const cardIds = value.cards.map((card) => (card as { id: string }).id)
  if (new Set(cardIds).size !== cardIds.length) return false
  const presentFaces = new Set(value.cards.map((card) => (card as { pairId: PairFaceId }).pairId))
  if (presentFaces.size !== pairCount || value.cards.some((card) => !presentFaces.has((card as { pairId: PairFaceId }).pairId))) return false
  for (const pairId of presentFaces) {
    if (value.cards.filter((card) => (card as { pairId: PairFaceId }).pairId === pairId).length !== 2) return false
    if (!cardIds.includes(`${pairId}-a`) || !cardIds.includes(`${pairId}-b`)) return false
  }

  const matchedPairIds = value.matchedPairIds
  if (!Array.isArray(matchedPairIds) || !matchedPairIds.every(isFaceId)) return false
  if (new Set(matchedPairIds).size !== matchedPairIds.length || matchedPairIds.some((id) => !presentFaces.has(id))) return false
  const revealedCardIds = value.revealedCardIds
  if (!Array.isArray(revealedCardIds) || revealedCardIds.length > 1) return false
  if (!revealedCardIds.every((id) => typeof id === 'string' && cardIds.includes(id))) return false
  if (revealedCardIds.some((id) => matchedPairIds.includes((value.cards as Array<{ id: string; pairId: PairFaceId }>).find((card) => card.id === id)!.pairId))) return false
  return Number.isSafeInteger(value.turns)
    && (value.turns as number) >= matchedPairIds.length
}

export const serializePairsState = (state: PairsState): PairsState => {
  const stableState = state.revealedCardIds.length === 2
    ? { ...state, revealedCardIds: [] }
    : state
  return JSON.parse(JSON.stringify(stableState)) as PairsState
}

export const restorePairsState = (value: unknown): PairsState | null => {
  if (!isPairsState(value)) return null
  return {
    boardSize: value.boardSize,
    cards: value.cards.map((card) => ({ ...card })),
    revealedCardIds: [...value.revealedCardIds],
    matchedPairIds: [...value.matchedPairIds],
    turns: value.turns,
  }
}
