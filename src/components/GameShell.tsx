import type { ReactNode } from 'react'

export const GameShell = ({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) => (
  <section className="space-y-3">
    <div className="flex flex-wrap items-center gap-4">
      <button type="button" onClick={onBack} className="zen-game-button">Back to games</button>
      <h1 className="text-2xl font-semibold">{title}</h1>
    </div>
    {children}
  </section>
)
