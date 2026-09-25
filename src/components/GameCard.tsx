import type { GameDefinition } from '../app/gameRegistry'

export const GameCard = ({ game, onSelect }: { game: GameDefinition; onSelect: () => void }) => (
  <button
    type="button"
    onClick={onSelect}
    className="flex min-h-40 w-full flex-col items-start justify-center gap-2 rounded-lg border-2 border-emerald-900/30 bg-white p-6 text-left shadow-sm transition-colors hover:bg-emerald-50 dark:border-emerald-200/30 dark:bg-zinc-800 dark:hover:bg-zinc-700"
  >
    <span className="text-2xl font-semibold">{game.name}</span>
    <span className="text-lg leading-snug text-zinc-700 dark:text-zinc-200">{game.description}</span>
  </button>
)
