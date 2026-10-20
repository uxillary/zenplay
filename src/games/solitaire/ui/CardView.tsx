import type { DragEvent, TouchEvent } from 'react'
import { useRef } from 'react'
import type { Card, Suit } from '../model/types'
import { describeSolitaireCard } from './cardAccessibility'
import { courtCardAsset, numberedPips, suitPaths } from './cardArtwork'

const SuitMark = ({ suit, className = '' }: { suit: Suit; className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <path d={suitPaths[suit]} fill="currentColor" />
  </svg>
)

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
  placeholderKind?: 'foundation' | 'tableau'
  placeholderSuit?: Suit | null
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
  placeholderKind,
  placeholderSuit,
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
    return <div className={`zen-card-placeholder ${size} ${placeholderKind ? `zen-card-placeholder--${placeholderKind}` : ''}`} aria-hidden="true">
      {placeholderKind === 'foundation' && placeholderSuit ? <SuitMark suit={placeholderSuit} className="zen-card-placeholder__suit" /> : null}
      {placeholderKind === 'tableau' ? <span className="zen-card-placeholder__king">K</span> : null}
    </div>
  }

  if (!card) return null

  if (!card.faceUp) {
    return <div className={`${baseCardClass} zen-card-back ${animate ? 'zen-card-flip' : ''}`} aria-hidden="true" />
  }

  const red = card.suit === 'hearts' || card.suit === 'diamonds'
  const suitColour = red ? 'zen-card-suit--red' : 'zen-card-suit--black'
  const courtAsset = courtCardAsset(card)
  const content = (
    <>
      {courtAsset ? <img className="zen-card-art" src={courtAsset} alt="" draggable="false" aria-hidden="true" /> : (
        <svg className={`zen-card-art ${suitColour}`} viewBox="0 0 360 540" aria-hidden="true" focusable="false">
          {(card.rank === 'J' || card.rank === 'Q' || card.rank === 'K' ? [] : numberedPips[card.rank]).map((pip, index) => (
            <path
              key={index}
              d={suitPaths[card.suit]}
              fill="currentColor"
              transform={`translate(${pip.x} ${pip.y}) rotate(${pip.inverted ? 180 : 0}) scale(${(pip.size ?? 64) / 100}) translate(-50 -50)`}
            />
          ))}
        </svg>
      )}
      <span className={`zen-card-corner zen-card-corner--top ${suitColour}`} aria-hidden="true">
        <span className={card.rank === '10' ? 'zen-card-corner__rank--double' : undefined}>{card.rank}</span><SuitMark suit={card.suit} className="zen-card-corner__suit" />
      </span>
      <span className={`zen-card-corner zen-card-corner--bottom ${suitColour}`} aria-hidden="true">
        <span className={card.rank === '10' ? 'zen-card-corner__rank--double' : undefined}>{card.rank}</span><SuitMark suit={card.suit} className="zen-card-corner__suit" />
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
      aria-label={`${describeSolitaireCard(card)}${selected ? ', selected' : ''}${hinted ? ', suggested move' : ''}`}
      aria-pressed={Boolean(selected)}
    >
      {content}
    </button>
  )
}
