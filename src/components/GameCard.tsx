import type { MouseEvent } from 'react'
import type { GameSummary } from '../app/gameCatalogue'

const gameMotif: Record<GameSummary['id'], string> = {
  solitaire: '♠  ♥  ♦  ♣',
  sudoku: '1  2  3',
  pairs: '●  ○',
  'word-search': 'A  B  C',
  'noughts-crosses': '×  ○  ×',
  fifteen: '1  2  3  4',
  mahjong: '🀙  🀐  🀀',
  flags: '⚑  ⚑  ⚑',
}

type Props = {
  game: GameSummary
  href?: string
  onSelect?: (event: MouseEvent<HTMLElement>) => void
  canContinue?: boolean
  onContinue?: (event: MouseEvent<HTMLElement>) => void
}

export const GameCard = ({ game, href, onSelect, canContinue = false, onContinue }: Props) => {
  const content = <>
    <span className="zen-game-card__motif" aria-hidden="true">{gameMotif[game.id]}</span>
    <span className="text-2xl font-semibold">{game.name}</span>
    <span className="zen-game-card__description text-lg leading-snug text-zinc-700 dark:text-zinc-200">{game.description}</span>
  </>
  const className = 'zen-game-card__open flex min-h-24 flex-col items-start justify-center gap-2 p-2 text-left'
  return (
    <article className={`zen-game-card zen-game-card--${game.id.replace('-', '')} flex min-h-40 flex-col items-stretch gap-3 p-4`}>
      {href ? <a href={href} onClick={onSelect} className={className}>{content}</a> : <button type="button" onClick={onSelect} className={className}>{content}</button>}
      {game.supportsContinue && canContinue && onContinue ? (
        href ? <a href={href} onClick={onContinue} className="zen-game-button zen-game-button--primary">Continue {game.name}</a>
          : <button type="button" onClick={onContinue} className="zen-game-button zen-game-button--primary">Continue {game.name}</button>
      ) : null}
    </article>
  )
}
