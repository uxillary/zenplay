import { SUITS, type Card, type Rank, type Suit } from '../model/types.ts'

// One set of vector silhouettes serves the centre pips, corner indices and empty foundations.
export const suitPaths: Record<Suit, string> = {
  hearts: 'M50 89C42 81 10 59 10 35 10 14 35 8 50 27 65 8 90 14 90 35 90 59 58 81 50 89Z',
  diamonds: 'M50 5 92 50 50 95 8 50Z',
  clubs: 'M50 7a20 20 0 1 0 0 40 20 20 0 1 0 0-40ZM27 35a20 20 0 1 0 0 40 20 20 0 1 0 0-40ZM73 35a20 20 0 1 0 0 40 20 20 0 1 0 0-40ZM44 61c1 13-3 22-13 30h38C59 83 55 74 56 61Z',
  spades: 'M50 7C39 23 10 40 10 59c0 18 23 24 35 7-1 12-5 19-14 25h38c-9-6-13-13-14-25 12 17 35 11 35-7C90 40 61 23 50 7Z',
}

export type PipPlacement = { x: number; y: number; size?: number; inverted?: boolean }
const p = (x: number, y: number, inverted = false): PipPlacement => ({ x, y, inverted })

// Coordinates use a 360 × 540 card, with room for both corner indices.
export const numberedPips: Record<Exclude<Rank, 'J' | 'Q' | 'K'>, readonly PipPlacement[]> = {
  A: [{ x: 180, y: 270, size: 154 }],
  '2': [p(180, 150), p(180, 390, true)],
  '3': [p(180, 135), p(180, 270), p(180, 405, true)],
  '4': [p(115, 150), p(245, 150), p(115, 390, true), p(245, 390, true)],
  '5': [p(115, 150), p(245, 150), p(180, 270), p(115, 390, true), p(245, 390, true)],
  '6': [p(115, 130), p(245, 130), p(115, 270), p(245, 270), p(115, 410, true), p(245, 410, true)],
  '7': [p(115, 130), p(245, 130), p(180, 195), p(115, 270), p(245, 270), p(115, 410, true), p(245, 410, true)],
  '8': [p(115, 130), p(245, 130), p(180, 195), p(115, 270), p(245, 270), p(180, 345, true), p(115, 410, true), p(245, 410, true)],
  '9': [p(115, 115), p(245, 115), p(115, 215), p(245, 215), p(180, 270), p(115, 325, true), p(245, 325, true), p(115, 425, true), p(245, 425, true)],
  '10': [p(115, 115), p(245, 115), p(180, 180), p(115, 215), p(245, 215), p(115, 325, true), p(245, 325, true), p(180, 360, true), p(115, 425, true), p(245, 425, true)],
}

export const courtCardAsset = (card: Card): string | null => {
  const rank = card.rank === 'J' ? 'jack' : card.rank === 'Q' ? 'queen' : card.rank === 'K' ? 'king' : null
  return rank ? `/cards/english-pattern/${rank}_of_${card.suit}.svg` : null
}

// An empty foundation accepts any Ace. Symbols are guides for missing suits and
// are reassigned after an Ace is placed in a different slot.
export const foundationGuideSuits = (foundations: readonly (readonly Card[])[]): (Suit | null)[] => {
  const occupied = new Set(foundations.flatMap((pile) => pile.length ? [pile[0].suit] : []))
  const available = SUITS.filter((suit) => !occupied.has(suit))
  return foundations.map((pile) => pile.length ? null : available.shift() ?? null)
}
