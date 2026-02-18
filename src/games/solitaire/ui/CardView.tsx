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
  largeCards?: boolean
  placeholder?: boolean
}

export const CardView = ({ card, selected, onClick, largeCards, placeholder }: Props) => {
  const height = largeCards ? 'h-32 w-24' : 'h-28 w-20'

  if (placeholder) {
    return <div className={`${height} rounded-xl border-2 border-dashed border-zinc-500/60 bg-zinc-900/35`} />
  }

  if (!card) return null

  if (!card.faceUp) {
    if (!onClick) {
      return <div className={`${height} rounded-xl border border-zinc-500 bg-zinc-700`} aria-hidden />
    }
    return <button type="button" onClick={onClick} className={`${height} rounded-xl border border-zinc-500 bg-zinc-700`} aria-label="Face down card" />
  }

  const red = card.suit === 'hearts' || card.suit === 'diamonds'
  const content = (
    <>
      <div className={`font-semibold ${red ? 'text-red-700' : 'text-zinc-900'}`}>{card.rank}</div>
      <div className={`text-xl ${red ? 'text-red-700' : 'text-zinc-900'}`}>{suitSymbol[card.suit]}</div>
    </>
  )

  if (!onClick) {
    return <div className={`${height} rounded-xl border bg-white p-2 text-left text-lg text-zinc-900 ${selected ? 'border-sky-600 ring-2 ring-sky-500' : 'border-zinc-300'}`}>{content}</div>
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${height} rounded-xl border bg-white p-2 text-left text-lg text-zinc-900 ${selected ? 'border-sky-600 ring-2 ring-sky-500' : 'border-zinc-300'}`}
      aria-label={`${card.rank} of ${card.suit}`}
    >
      {content}
    </button>
  )
}
