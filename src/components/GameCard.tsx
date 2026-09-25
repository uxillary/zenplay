import type { GameDefinition } from '../app/gameRegistry'

const gameMotif: Record<GameDefinition['id'], string> = {
  solitaire: '♠  ♥  ♦  ♣',
  sudoku: '1  2  3',
  pairs: '●  ○',
  'word-search': 'A  B  C',
  'noughts-crosses': '×  ○  ×',
  fifteen: '1  2  3  4',
}

type Props = {
  game: GameDefinition
  onSelect: () => void
  canContinue?: boolean
  onContinue?: () => void
}

export const GameCard = ({ game, onSelect, canContinue = false, onContinue }: Props) => (
  <article className={`zen-game-card zen-game-card--${game.id.replace('-', '')} flex min-h-40 flex-col items-stretch gap-3 p-4`}>
    <button type="button" onClick={onSelect} className="zen-game-card__open flex min-h-24 flex-col items-start justify-center gap-2 p-2 text-left">
      <span className="zen-game-card__motif" aria-hidden="true">{gameMotif[game.id]}</span>
      <span className="text-2xl font-semibold">{game.name}</span>
      <span className="zen-game-card__description text-lg leading-snug text-zinc-700 dark:text-zinc-200">{game.description}</span>
    </button>
    {game.supportsContinue && canContinue && onContinue ? (
      <button type="button" onClick={onContinue} className="zen-game-button zen-game-button--primary">Continue {game.name}</button>
    ) : null}
  </article>
)
