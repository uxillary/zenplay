export const PAIRS_BOARD_SIZES = ['easy', 'standard', 'more'] as const
export type PairsBoardSize = typeof PAIRS_BOARD_SIZES[number]

export const PAIR_FACES = [
  { id: 'sun', label: 'sun' },
  { id: 'star', label: 'star' },
  { id: 'heart', label: 'heart' },
  { id: 'leaf', label: 'leaf' },
  { id: 'house', label: 'house' },
  { id: 'key', label: 'key' },
  { id: 'flower', label: 'flower' },
  { id: 'umbrella', label: 'umbrella' },
  { id: 'bell', label: 'bell' },
  { id: 'boat', label: 'boat' },
  { id: 'apple', label: 'apple' },
  { id: 'tree', label: 'tree' },
] as const

export type PairFaceId = typeof PAIR_FACES[number]['id']

export type PairCard = {
  id: string
  pairId: PairFaceId
}

export type PairsState = {
  boardSize: PairsBoardSize
  cards: PairCard[]
  revealedCardIds: string[]
  matchedPairIds: PairFaceId[]
  turns: number
}

export const PAIRS_PER_BOARD_SIZE: Record<PairsBoardSize, number> = {
  easy: 6,
  standard: 8,
  more: 12,
}
