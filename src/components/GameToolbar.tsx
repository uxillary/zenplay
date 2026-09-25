import type { ReactNode } from 'react'

export const GameToolbar = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`zen-game-toolbar flex flex-wrap items-center gap-2 ${className}`} role="group" aria-label="Game controls">{children}</div>
)
