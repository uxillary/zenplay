import type { DragEvent } from 'react'
import type { Card } from '../model/types'
import { CardView } from './CardView'

type Props = {
  cards: Card[]
  onCardClick: (card: Card) => void
  onCardDoubleClick: (card: Card) => void
  onCardDragStart: (card: Card, event: DragEvent<HTMLElement>) => void
  onCardDrag: (event: DragEvent<HTMLElement>) => void
  onCardDragEnd: () => void
  onPileClick?: () => void
  onPileDrop?: () => void
  selectedCardId?: string
  largeCards: boolean
  canDrop?: boolean
  onEmptyClick?: () => void
  draggingCardId?: string
  motionEnabled: boolean
}

export const PileView = ({
  cards,
  onCardClick,
  onCardDoubleClick,
  onCardDragStart,
  onCardDrag,
  onCardDragEnd,
  onPileClick,
  onPileDrop,
  selectedCardId,
  largeCards,
  canDrop,
  onEmptyClick,
  draggingCardId,
  motionEnabled,
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
        className={canDrop ? 'zen-drop-target' : ''}
      >
        <CardView placeholder largeCards={largeCards} />
      </button>
    )
  }

  return (
    <div
      className="zen-pile-column relative min-h-28"
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
      {cards.map((card, index) => {
        const draggingIndex = draggingCardId ? cards.findIndex((pileCard) => pileCard.id === draggingCardId) : -1
        const ghosted = draggingIndex >= 0 && index >= draggingIndex

        return (
          <div
            key={card.id}
            className={`absolute ${motionEnabled ? 'zen-card-position' : ''} ${canDrop && index === cards.length - 1 ? 'zen-drop-target' : ''}`}
            style={{ top: `${topOffsetFor(index)}px` }}
          >
          <CardView
            card={card}
            selected={selectedCardId === card.id}
            largeCards={largeCards}
            onClick={() => onCardClick(card)}
            onDoubleClick={() => onCardDoubleClick(card)}
            onDragStart={card.faceUp ? (event) => onCardDragStart(card, event) : undefined}
            onDrag={onCardDrag}
            onDragEnd={onCardDragEnd}
            ghosted={ghosted}
            animate={motionEnabled}
          />
          </div>
        )
      })}
      <div style={{ height: `${topOffsetFor(cards.length - 1) + cardHeight}px` }} />
    </div>
  )
}
