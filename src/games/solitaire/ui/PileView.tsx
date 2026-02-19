import type { Card } from '../model/types'
import { CardView } from './CardView'

type Props = {
  cards: Card[]
  onCardClick: (card: Card) => void
  onPileClick?: () => void
  selectedCardId?: string
  largeCards: boolean
  canDrop?: boolean
  onEmptyClick?: () => void
}

export const PileView = ({ cards, onCardClick, onPileClick, selectedCardId, largeCards, canDrop, onEmptyClick }: Props) => {
  if (cards.length === 0) {
    return (
      <button type="button" onClick={onEmptyClick} className={`${canDrop ? 'ring-2 ring-sky-500 rounded-xl' : ''}`}>
        <CardView placeholder largeCards={largeCards} />
      </button>
    )
  }

  return (
    <div
      className={`relative min-h-28 ${canDrop ? 'rounded-xl ring-2 ring-sky-500' : ''}`}
      onClick={onPileClick}
      role={onPileClick ? 'button' : undefined}
      tabIndex={onPileClick ? 0 : undefined}
      onKeyDown={
        onPileClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onPileClick()
              }
            }
          : undefined
      }
    >
      {cards.map((card, index) => (
        <div key={card.id} className="absolute" style={{ top: `${index * (largeCards ? 28 : 22)}px` }}>
          <CardView
            card={card}
            selected={selectedCardId === card.id}
            largeCards={largeCards}
            onClick={() => onCardClick(card)}
          />
        </div>
      ))}
      <div style={{ height: `${(cards.length - 1) * (largeCards ? 28 : 22) + (largeCards ? 128 : 112)}px` }} />
    </div>
  )
}
