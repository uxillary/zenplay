import type { ReactNode } from 'react'
import { shouldHandleLinkClick } from '../app/navigation'

export const GameShell = ({ title, onBack, children, compactBack = false }: { title: string; onBack?: () => void; children: ReactNode; compactBack?: boolean }) => (
  <section className="zen-game-shell space-y-3">
    <div className="zen-game-shell__header flex flex-wrap items-center gap-4">
      <a href="/" onClick={onBack ? (event) => {
        if (shouldHandleLinkClick(event)) { event.preventDefault(); onBack() }
      } : undefined} className="zen-game-button zen-game-button--back" aria-label={compactBack ? 'Back to Games' : undefined}>{compactBack ? '‹ Games' : 'Back to Games'}</a>
      <h1 data-screen-heading tabIndex={-1} className="zen-game-title">{title}</h1>
    </div>
    {children}
  </section>
)
