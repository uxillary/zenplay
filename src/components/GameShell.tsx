import type { ReactNode } from 'react'

export const GameShell = ({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) => (
  <section className="zen-game-shell space-y-3">
    <div className="zen-game-shell__header flex flex-wrap items-center gap-4">
      <button type="button" onClick={onBack} className="zen-game-button zen-game-button--back">Back to Games</button>
      <h1 className="zen-game-title">{title}</h1>
    </div>
    {children}
  </section>
)
