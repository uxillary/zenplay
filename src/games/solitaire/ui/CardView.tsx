import type { DragEvent } from 'react'
import { useRef } from 'react'
import type { Card } from '../model/types'

const suitSymbol = {
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
  spades: '♠',
}

type Props = {
  card?: Card
  selected?: boolean
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
  const baseCardClass = `zen-playing-card ${size} transition-opacity duration-150 ${ghosted ? 'opacity-35' : 'opacity-100'} ${animate ? 'zen-card-enter' : ''}`
  const handleTouchEnd = () => {
    if (!onDoubleClick) return
    const now = window.performance.now()
    if (now - lastTapAt.current < 320) {
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
    if (!onClick) {
      return <div className={`${baseCardClass} zen-card-back ${animate ? 'zen-card-flip' : ''}`} aria-hidden />
    }
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onClick()
        }}
        onDoubleClick={(event) => {
          event.stopPropagation()
          onDoubleClick?.()
        }}
        onTouchEnd={handleTouchEnd}
        className={`${baseCardClass} zen-card-back ${animate ? 'zen-card-flip' : ''}`}
        aria-label="Face down card"
      />
    )
  }

  const red = card.suit === 'hearts' || card.suit === 'diamonds'
  const content = (
    <>
      <div className={`font-bold leading-none ${red ? 'text-red-700' : 'text-zinc-950'}`}>{card.rank}</div>
      <div className={`text-3xl leading-none ${red ? 'text-red-700' : 'text-zinc-950'}`}>{suitSymbol[card.suit]}</div>
      <div className={`mt-auto self-center text-5xl leading-none ${red ? 'text-red-700' : 'text-zinc-950'}`} aria-hidden>
        {suitSymbol[card.suit]}
      </div>
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
      aria-label={`${card.rank} of ${card.suit}`}
    >
      {content}
    </button>
  )
}
