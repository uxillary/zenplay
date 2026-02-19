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
  const size = largeCards ? 'h-40 w-32' : 'h-36 w-28'

  if (placeholder) {
    return <div className={`${size} rounded-xl border-2 border-dashed border-zinc-500/60 bg-zinc-900/35`} />
  }

  if (!card) return null

  if (!card.faceUp) {
    if (!onClick) {
      return <div className={`${size} rounded-xl border border-zinc-500 bg-zinc-700`} aria-hidden />
    }
    return <button type="button" onClick={onClick} className={`${size} rounded-xl border border-zinc-500 bg-zinc-700`} aria-label="Face down card" />
  }

  const red = card.suit === 'hearts' || card.suit === 'diamonds'
  const rankSize = largeCards ? 'text-3xl' : 'text-2xl'
  const cornerSuitSize = largeCards ? 'text-3xl' : 'text-2xl'
  const centerSuitSize = largeCards ? 'text-6xl' : 'text-5xl'
  const content = (
    <>
      <div className="flex h-full flex-col justify-between">
        <div className={`leading-none font-black ${rankSize} ${red ? 'text-red-800' : 'text-black'}`}>
          <span>{card.rank}</span>
          <span className={`ml-1 inline-block ${cornerSuitSize}`}>{suitSymbol[card.suit]}</span>
        </div>
        <div className={`self-center leading-none ${centerSuitSize} ${red ? 'text-red-800' : 'text-black'}`} aria-hidden>
          {suitSymbol[card.suit]}
        </div>
        <div className={`self-end leading-none font-black ${rankSize} ${red ? 'text-red-800' : 'text-black'}`}>
          <span className={`mr-1 inline-block ${cornerSuitSize}`}>{suitSymbol[card.suit]}</span>
          <span>{card.rank}</span>
        </div>
      </div>
    </>
  )

  if (!onClick) {
    return <div className={`${size} rounded-xl border bg-white p-3 text-left text-zinc-900 ${selected ? 'border-sky-600 ring-2 ring-sky-500' : 'border-zinc-300'}`}>{content}</div>
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${size} rounded-xl border bg-white p-3 text-left text-zinc-900 ${selected ? 'border-sky-600 ring-2 ring-sky-500' : 'border-zinc-300'}`}
      aria-label={`${card.rank} of ${card.suit}`}
    >
      {content}
    </button>
  )
}
