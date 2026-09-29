import type { Suit } from '../model/types'

type CourtRank = 'J' | 'Q' | 'K'

type Props = {
  rank: CourtRank
  suit: Suit
}

const suitSymbol: Record<Suit, string> = {
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
  spades: '♠',
}

type HalfProps = {
  rank: CourtRank
  ink: string
  robe: string
  gold: string
  skin: string
}

const CourtHalf = ({ rank, ink, robe, gold, skin }: HalfProps) => (
  <>
    <path d="M17 50l2-9c1-6 6-10 13-12h8c7 2 12 6 13 12l2 9z" fill={robe} stroke={ink} strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M27 36l9 7 9-7" fill="none" stroke={gold} strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M32 29h8v8h-8z" fill={skin} stroke={ink} strokeWidth="1.2" />
    <ellipse cx="36" cy="21" rx="9" ry="11" fill={skin} stroke={ink} strokeWidth="1.5" />
    {rank === 'J' ? (
      <>
        <path d="M27 17c0-7 4-11 10-11 5 0 9 3 10 8l-4 3c-3-3-8-4-16 0z" fill={ink} />
        <path d="M42 11c6-8 10-7 9-4-1 3-4 5-8 7" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" />
      </>
    ) : rank === 'Q' ? (
      <>
        <path d="M26 18c0-7 4-11 10-11s10 4 10 11v15l-4 5-2-8H31l-2 8-4-5z" fill={ink} />
        <path d="M24 13l-2-8 8 5 6-8 6 8 8-5-2 8z" fill={gold} stroke={ink} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M27 14h18" stroke={ink} strokeWidth="1.8" />
        <path d="M29 34l-4 9m18-9 4 9" stroke={gold} strokeWidth="1.5" />
      </>
    ) : (
      <>
        <path d="M25 18c0-7 4-11 11-11s11 4 11 11v9l-4 5H29l-4-5z" fill={ink} />
        <path d="M22 14l-2-8 9 5 7-9 7 9 9-5-2 8z" fill={gold} stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M23 14h26v4H23z" fill={gold} stroke={ink} strokeWidth="1.2" />
        <circle cx="21" cy="6" r="2" fill={gold} /><circle cx="36" cy="2" r="2" fill={gold} /><circle cx="51" cy="6" r="2" fill={gold} />
        <path d="M27 25q9 8 18 0l-2 11-7 5-7-5z" fill={robe} stroke={ink} strokeWidth="1.4" strokeLinejoin="round" />
      </>
    )}
  </>
)

export const CourtCardArt = ({ rank, suit }: Props) => {
  const red = suit === 'hearts' || suit === 'diamonds'
  const ink = red ? '#854b47' : '#394844'
  const robe = red ? '#ead6cb' : '#d5d9ce'
  const gold = '#a78348'

  return (
    <svg className="zen-court-card-art" viewBox="0 0 72 104" aria-hidden="true" focusable="false" pointerEvents="none">
      <g>
        <CourtHalf rank={rank} ink={ink} robe={robe} gold={gold} skin="#f2e5d1" />
      </g>
      <g transform="translate(72 104) rotate(180)">
        <CourtHalf rank={rank} ink={ink} robe={robe} gold={gold} skin="#f2e5d1" />
      </g>
      <text x="36" y="54" textAnchor="middle" fontSize="11" fill={red ? '#a43d43' : '#303a38'}>{suitSymbol[suit]}</text>
    </svg>
  )
}
