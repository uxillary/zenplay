import { RANKS, SUITS, type Card, type SolitaireState } from './types.ts'
import { isWin } from './rules.ts'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isCard = (value: unknown): value is Card => {
  if (!isRecord(value)) return false
  return typeof value.id === 'string'
    && SUITS.includes(value.suit as Card['suit'])
    && RANKS.includes(value.rank as Card['rank'])
    && value.id === `${value.suit}-${value.rank}`
    && typeof value.faceUp === 'boolean'
}

const isCardPile = (value: unknown): value is Card[] => Array.isArray(value) && value.every(isCard)

const hasCompleteDeck = (piles: Card[][]): boolean => {
  const cards = piles.flat()
  if (cards.length !== 52) return false
  const ids = new Set(cards.map((card) => card.id))
  return ids.size === 52 && SUITS.every((suit) => RANKS.every((rank) => ids.has(`${suit}-${rank}`)))
}

const isSnapshot = (value: unknown): value is Omit<SolitaireState, 'history'> => {
  if (!isRecord(value)) return false
  if (!Array.isArray(value.tableau) || value.tableau.length !== 7 || !value.tableau.every(isCardPile)) return false
  if (!Array.isArray(value.foundations) || value.foundations.length !== 4 || !value.foundations.every(isCardPile)) return false
  if (!isCardPile(value.stock) || !isCardPile(value.waste)) return false
  return hasCompleteDeck([...value.tableau, ...value.foundations, value.stock, value.waste])
}

export const isSolitaireState = (value: unknown): value is SolitaireState => {
  if (!isRecord(value) || !Array.isArray(value.history) || value.history.length > 10000) return false
  const history: unknown[] = value.history
  if (!isSnapshot(value)) return false
  return history.every(isSnapshot)
}

export const isResumableSolitaireState = (value: unknown): value is SolitaireState =>
  isSolitaireState(value) && !isWin(value)

export const serializeSolitaireState = (state: SolitaireState): SolitaireState =>
  JSON.parse(JSON.stringify(state)) as SolitaireState

export const restoreSolitaireState = (value: unknown): SolitaireState | null => {
  if (!isSolitaireState(value)) return null
  const copySnapshot = (snapshot: Omit<SolitaireState, 'history'>): Omit<SolitaireState, 'history'> => ({
    tableau: snapshot.tableau.map((pile) => pile.map((card) => ({ ...card }))),
    foundations: snapshot.foundations.map((pile) => pile.map((card) => ({ ...card }))),
    stock: snapshot.stock.map((card) => ({ ...card })),
    waste: snapshot.waste.map((card) => ({ ...card })),
  })
  return {
    ...copySnapshot(value),
    history: value.history.map(copySnapshot),
  }
}
