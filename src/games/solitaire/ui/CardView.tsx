import type { DragEvent, TouchEvent } from 'react'
import { useRef } from 'react'
import type { Card } from '../model/types'

const suitSymbol = {
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
  spades: '♠',
}

const rankLabel: Record<Card['rank'], string> = {
  A: 'Ace', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
  J: 'Jack', Q: 'Queen', K: 'King',
}

const accessibleCardName = (card: Card): string =>
  `${rankLabel[card.rank]} of ${card.suit[0].toUpperCase()}${card.suit.slice(1)}`

type Props = {
  card?: Card
  selected?: boolean
  hinted?: boolean
  onClick?: () => void
  onDoubleClick?: () => void
  onDragStart?: (event: DragEvent<HTMLElement>) => void
  onDrag?: (event: DragEvent<HTMLElement>) => void
  onDragEnd?: () => void
  largeCards?: boolean
  placeholder?: boolean
  ghosted?: boolean
  animate?: boolean
}

const hideNativeDragPreview = (event: DragEvent<HTMLElement>) => {
  const preview = document.createElement('div')
  preview.style.width = '1px'
  preview.style.height = '1px'
  preview.style.opacity = '0'
  document.body.append(preview)
  event.dataTransfer.setDragImage(preview, 0, 0)
  window.setTimeout(() => preview.remove(), 0)
}

export const CardView = ({
  card,
  selected,
  hinted,
  onClick,
  onDoubleClick,
  onDragStart,
  onDrag,
  onDragEnd,
  largeCards,
  placeholder,
  ghosted,
  animate,
}: Props) => {
  const lastTapAt = useRef(0)
  const size = largeCards ? 'zen-playing-card--large' : 'zen-playing-card--standard'
  const baseCardClass = `zen-playing-card ${size} transition-opacity duration-150 ${ghosted ? 'opacity-35' : 'opacity-100'} ${animate ? 'zen-card-enter' : ''} ${hinted ? 'zen-hint-source' : ''}`
  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (!onDoubleClick) return
    const now = window.performance.now()
    if (now - lastTapAt.current < 320) {
      event.preventDefault()
      onDoubleClick()
      lastTapAt.current = 0
      return
    }
    lastTapAt.current = now
  }

  if (placeholder) {
    return <div className={`zen-card-placeholder ${size}`} aria-hidden />
  }

  if (!card) return null

  if (!card.faceUp) {
    return <div className={`${baseCardClass} zen-card-back ${animate ? 'zen-card-flip' : ''}`} aria-hidden="true" />
  }

  const red = card.suit === 'hearts' || card.suit === 'diamonds'
  const suitColour = red ? 'zen-card-suit--red' : 'zen-card-suit--black'
  const content = (
    <>
      <span className={`zen-card-corner zen-card-corner--top ${suitColour}`} aria-hidden="true">
        <span>{card.rank}</span><span className="zen-card-corner__suit">{suitSymbol[card.suit]}</span>
      </span>
      <span className={`zen-card-center-suit ${suitColour}`} aria-hidden="true">{suitSymbol[card.suit]}</span>
      <span className={`zen-card-corner zen-card-corner--bottom ${suitColour}`} aria-hidden="true">
        <span>{card.rank}</span><span className="zen-card-corner__suit">{suitSymbol[card.suit]}</span>
      </span>
    </>
  )

  if (!onClick) {
    return (
      <div
        draggable={Boolean(onDragStart)}
        onDragStart={(event) => {
          if (!onDragStart) return
          event.dataTransfer.effectAllowed = 'move'
          hideNativeDragPreview(event)
          onDragStart(event)
        }}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        onTouchEnd={handleTouchEnd}
        className={`${baseCardClass} zen-card-face ${selected ? 'zen-card-selected' : ''}`}
      >
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      draggable={Boolean(onDragStart)}
      onDragStart={(event) => {
        if (!onDragStart) return
        event.dataTransfer.effectAllowed = 'move'
        hideNativeDragPreview(event)
        onDragStart(event)
      }}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      onDoubleClick={(event) => {
        event.stopPropagation()
        onDoubleClick?.()
      }}
      onTouchEnd={handleTouchEnd}
      className={`${baseCardClass} zen-card-face ${selected ? 'zen-card-selected' : ''}`}
      aria-label={`${accessibleCardName(card)}${selected ? ', selected' : ''}${hinted ? ', suggested move' : ''}`}
      aria-pressed={Boolean(selected)}
    >
      {content}
    </button>
  )
}
