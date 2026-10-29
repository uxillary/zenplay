import type { PointerEvent } from 'react'
import type { Card } from '../model/types'
import type { SolitaireCardFaces } from '../../../lib/settings'
import { CardView } from './CardView'

type Props = {
  cards: Card[]
  columnIndex: number
  ariaLabel: string
  onCardClick: (card: Card) => void
  onCardDoubleClick: (card: Card) => void
  onCardPointerDown: (card: Card, event: PointerEvent<HTMLElement>) => void
  onCardPointerMove: (event: PointerEvent<HTMLElement>) => void
  onCardPointerUp: (event: PointerEvent<HTMLElement>) => void
  onCardPointerCancel: (event: PointerEvent<HTMLElement>) => void
  onPileClick?: () => void
  selectedCardId?: string
  largeCards: boolean
  canDrop?: boolean
  dragHover?: boolean
  onEmptyClick?: () => void
  draggingCardId?: string
  hintedCardId?: string
  hintedDestination?: boolean
  motionEnabled: boolean
  cardFaces: SolitaireCardFaces
}

export const PileView = ({
  cards,
  columnIndex,
  ariaLabel,
  onCardClick,
  onCardDoubleClick,
  onCardPointerDown,
  onCardPointerMove,
  onCardPointerUp,
  onCardPointerCancel,
  onPileClick,
  selectedCardId,
  largeCards,
  canDrop,
  dragHover,
  onEmptyClick,
  draggingCardId,
  hintedCardId,
  hintedDestination,
  motionEnabled,
  cardFaces,
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
        data-solitaire-drop={`tableau:${columnIndex}`}
        className={`zen-empty-pile ${canDrop ? 'zen-drop-target' : ''} ${dragHover ? 'zen-drag-hover' : ''} ${hintedDestination ? 'zen-hint-destination' : ''}`}
        aria-label={ariaLabel}
      >
        <CardView placeholder placeholderKind="tableau" largeCards={largeCards} />
      </button>
    )
  }

  return (
    <div
      className={`zen-pile-column relative ${dragHover ? 'zen-drag-hover' : ''} ${hintedDestination ? 'zen-hint-destination' : ''}`}
      onClick={onPileClick}
      data-solitaire-drop={`tableau:${columnIndex}`}
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
            cardFaces={cardFaces}
            selected={selectedCardId === card.id}
            hinted={hintedCardId === card.id}
            largeCards={largeCards}
            onClick={() => onCardClick(card)}
            onDoubleClick={() => onCardDoubleClick(card)}
            onPointerDown={card.faceUp ? (event) => onCardPointerDown(card, event) : undefined}
            onPointerMove={onCardPointerMove}
            onPointerUp={onCardPointerUp}
            onPointerCancel={onCardPointerCancel}
            onLostPointerCapture={onCardPointerCancel}
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
