import type { Card, Location, SolitaireState } from '../model/types'

const rankNames: Record<Card['rank'], string> = {
  A: 'Ace', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
  J: 'Jack', Q: 'Queen', K: 'King',
}

export const describeSolitaireCard = (card?: Card): string => {
  if (!card) return 'empty'
  if (!card.faceUp) return 'face-down card'
  return `${rankNames[card.rank]} of ${card.suit[0].toUpperCase()}${card.suit.slice(1)}`
}

export const describeSelectedSolitaireCard = (
  selection: { location: Location; cardId: string } | null,
  state: Pick<SolitaireState, 'waste' | 'tableau'>,
): string | null => {
  if (!selection) return null
  const pile = selection.location.type === 'waste'
    ? state.waste
    : selection.location.type === 'tableau'
      ? state.tableau[selection.location.index]
      : undefined
  const card = pile?.find((item) => item.id === selection.cardId)
  return `${card ? describeSolitaireCard(card) : 'Card'} selected. Tap a destination or cancel.`
}
