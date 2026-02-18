import { RANKS, SUITS, type Card, type SolitaireState } from './types'

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const makeDeck = (): Card[] =>
  SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({
      id: `${suit}-${rank}`,
      suit,
      rank,
      faceUp: false,
    })),
  )

export const createInitialState = (): SolitaireState => {
  const deck = shuffle(makeDeck())
  const tableau = Array.from({ length: 7 }, () => [] as Card[])

  for (let pile = 0; pile < 7; pile += 1) {
    for (let depth = 0; depth <= pile; depth += 1) {
      const card = deck.pop()
      if (!card) continue
      tableau[pile].push({ ...card, faceUp: depth === pile })
    }
  }

  return {
    tableau,
    foundations: [[], [], [], []],
    stock: deck,
    waste: [],
    history: [],
  }
}
