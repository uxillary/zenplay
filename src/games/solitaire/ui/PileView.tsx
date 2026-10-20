import type { DragEvent } from 'react'
import type { Card } from '../model/types'
import { CardView } from './CardView'

type Props = {
  cards: Card[]
  columnIndex: number
  ariaLabel: string
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
  hintedCardId?: string
  hintedDestination?: boolean
  motionEnabled: boolean
}

export const PileView = ({
  cards,
  columnIndex,
  ariaLabel,
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
  hintedCardId,
  hintedDestination,
  motionEnabled,
}: Props) => {
  const topOffsetFor = (index: number) => {
    const faceUpCount = cards.slice(0, index).filter((card) => card.faceUp).length
    return `calc(${faceUpCount} * var(--zen-faceup-step) + ${index - faceUpCount} * var(--zen-facedown-step))`
  }

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
        className={`zen-empty-pile ${canDrop ? 'zen-drop-target' : ''} ${hintedDestination ? 'zen-hint-destination' : ''}`}
        aria-label={ariaLabel}
      >
        <CardView placeholder placeholderLabel="K" largeCards={largeCards} />
      </button>
    )
  }

  return (
    <div
      className={`zen-pile-column relative ${hintedDestination ? 'zen-hint-destination' : ''}`}
      onClick={onPileClick}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        onPileDrop?.()
      }}
      role="group"
      aria-label={ariaLabel || `Tableau column ${columnIndex + 1}`}
    >
      {cards.map((card, index) => {
        const draggingIndex = draggingCardId ? cards.findIndex((pileCard) => pileCard.id === draggingCardId) : -1
        const ghosted = draggingIndex >= 0 && index >= draggingIndex

        return (
          <div
            key={card.id}
            className={`absolute ${motionEnabled ? 'zen-card-position' : ''} ${canDrop && index === cards.length - 1 ? 'zen-drop-target' : ''}`}
            style={{ top: topOffsetFor(index), zIndex: index }}
          >
          <CardView
            card={card}
            selected={selectedCardId === card.id}
            hinted={hintedCardId === card.id}
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
      <div style={{ height: `calc(${topOffsetFor(cards.length - 1)} + var(--zen-card-height))` }} />
    </div>
  )
}
