import type { Card } from '../model/types'
import { CardView } from './CardView'

type Props = {
  cards: Card[]
  onCardClick: (card: Card) => void
  onCardDragStart: (card: Card) => void
  onPileClick?: () => void
  onPileDrop?: () => void
  selectedCardId?: string
  largeCards: boolean
  canDrop?: boolean
  onEmptyClick?: () => void
}

export const PileView = ({
  cards,
  onCardClick,
  onCardDragStart,
  onPileClick,
  onPileDrop,
  selectedCardId,
  largeCards,
  canDrop,
  onEmptyClick,
}: Props) => {
  const cardHeight = largeCards ? 128 : 112
  const faceDownGap = largeCards ? 28 : 22
  const faceUpGap = largeCards ? 56 : 48
  const topOffsetFor = (index: number) =>
    cards.slice(0, index).reduce((offset, card) => offset + (card.faceUp ? faceUpGap : faceDownGap), 0)

  if (cards.length === 0) {
    return (
      <button
        type="button"
        onClick={onEmptyClick}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          onPileDrop?.()
        }}
        className={`${canDrop ? 'ring-2 ring-sky-500 rounded-xl' : ''}`}
      >
        <CardView placeholder largeCards={largeCards} />
      </button>
    )
  }

  return (
    <div
      className="relative min-h-28"
      onClick={onPileClick}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        onPileDrop?.()
      }}
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
        <div
          key={card.id}
          className={`absolute rounded-xl ${canDrop && index === cards.length - 1 ? 'ring-2 ring-sky-500' : ''}`}
          style={{ top: `${topOffsetFor(index)}px` }}
        >
          <CardView
            card={card}
            selected={selectedCardId === card.id}
            largeCards={largeCards}
            onClick={() => onCardClick(card)}
            onDragStart={card.faceUp ? () => onCardDragStart(card) : undefined}
          />
        </div>
      ))}
      <div style={{ height: `${topOffsetFor(cards.length - 1) + cardHeight}px` }} />
    </div>
  )
}
