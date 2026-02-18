export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades'
export type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'

export type Card = {
  id: string
  suit: Suit
  rank: Rank
  faceUp: boolean
}

export type Location =
  | { type: 'tableau'; index: number }
  | { type: 'foundation'; index: number }
  | { type: 'waste' }

export type Move = {
  from: Location
  to: Location
  cardId: string
}

export type TableauPile = Card[]
export type FoundationPile = Card[]

export type SolitaireState = {
  tableau: TableauPile[]
  foundations: FoundationPile[]
  stock: Card[]
  waste: Card[]
  history: Omit<SolitaireState, 'history'>[]
}

export const SUITS: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades']
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
