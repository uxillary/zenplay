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
  const size = largeCards ? 'h-36 w-28' : 'h-32 w-24'

  if (placeholder) {
    return <div className={`${size} rounded-xl border-2 border-dashed border-zinc-500/60 bg-zinc-900/35`} />
  }

  if (!card) return null

  if (!card.faceUp) {
    if (!onClick) {
      return <div className={`${size} rounded-xl border border-zinc-500 bg-zinc-700`} aria-hidden />
    }
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onClick()
        }}
        className={`${height} rounded-xl border border-zinc-500 bg-zinc-700`}
        aria-label="Face down card"
      />
    )
  }

  const red = card.suit === 'hearts' || card.suit === 'diamonds'
  const rankSize = largeCards ? 'text-2xl' : 'text-xl'
  const cornerSuitSize = largeCards ? 'text-2xl' : 'text-xl'
  const centerSuitSize = largeCards ? 'text-5xl' : 'text-4xl'
  const content = (
    <>
      <div className="flex h-full flex-col justify-between">
        <div className={`leading-none font-bold ${rankSize} ${red ? 'text-red-700' : 'text-zinc-900'}`}>
          <span>{card.rank}</span>
          <span className={`ml-1 inline-block ${cornerSuitSize}`}>{suitSymbol[card.suit]}</span>
        </div>
        <div className={`self-center leading-none ${centerSuitSize} ${red ? 'text-red-700' : 'text-zinc-900'}`} aria-hidden>
          {suitSymbol[card.suit]}
        </div>
        <div className={`self-end leading-none font-bold ${rankSize} ${red ? 'text-red-700' : 'text-zinc-900'}`}>
          <span className={`mr-1 inline-block ${cornerSuitSize}`}>{suitSymbol[card.suit]}</span>
          <span>{card.rank}</span>
        </div>
      </div>
    </>
  )

  if (!onClick) {
    return <div className={`${size} rounded-xl border bg-white p-2 text-left text-zinc-900 ${selected ? 'border-sky-600 ring-2 ring-sky-500' : 'border-zinc-300'}`}>{content}</div>
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className={`${height} rounded-xl border bg-white p-2 text-left text-lg text-zinc-900 ${selected ? 'border-sky-600 ring-2 ring-sky-500' : 'border-zinc-300'}`}
      aria-label={`${card.rank} of ${card.suit}`}
    >
      {content}
    </button>
  )
}
