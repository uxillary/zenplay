import type { Card } from '../model/types'

const rankNames: Record<Card['rank'], string> = {
  A: 'Ace', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
  J: 'Jack', Q: 'Queen', K: 'King',
}

export const describeSolitaireCard = (card?: Card): string => {
  if (!card) return 'empty'
  if (!card.faceUp) return 'face-down card'
  return `${rankNames[card.rank]} of ${card.suit[0].toUpperCase()}${card.suit.slice(1)}`
}
