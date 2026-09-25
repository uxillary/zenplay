import type { GameDefinition } from '../app/gameRegistry'

type Props = {
  game: GameDefinition
  onSelect: () => void
  canContinue?: boolean
  onContinue?: () => void
}

export const GameCard = ({ game, onSelect, canContinue = false, onContinue }: Props) => (
  <article className="zen-game-card flex min-h-40 flex-col items-stretch gap-3 rounded-lg border-2 border-emerald-900/30 bg-white p-4 shadow-sm dark:border-emerald-200/30 dark:bg-zinc-800">
    <button type="button" onClick={onSelect} className="flex min-h-24 flex-col items-start justify-center gap-2 rounded-md p-2 text-left transition-colors hover:bg-emerald-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:hover:bg-zinc-700 dark:focus-visible:outline-emerald-200">
      <span className="text-2xl font-semibold">{game.name}</span>
      <span className="text-lg leading-snug text-zinc-700 dark:text-zinc-200">{game.description}</span>
    </button>
    {game.supportsContinue && canContinue && onContinue ? (
      <button type="button" onClick={onContinue} className="zen-game-button">Continue {game.name}</button>
    ) : null}
  </article>
)
