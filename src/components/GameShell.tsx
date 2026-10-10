import type { ReactNode } from 'react'

export const GameShell = ({ title, onBack, children, compactBack = false }: { title: string; onBack: () => void; children: ReactNode; compactBack?: boolean }) => (
  <section className="zen-game-shell space-y-3">
    <div className="zen-game-shell__header flex flex-wrap items-center gap-4">
      <button type="button" onClick={onBack} className="zen-game-button zen-game-button--back" aria-label={compactBack ? 'Back to Games' : undefined}>{compactBack ? '‹ Games' : 'Back to Games'}</button>
      <h1 data-screen-heading tabIndex={-1} className="zen-game-title">{title}</h1>
    </div>
    {children}
  </section>
)
