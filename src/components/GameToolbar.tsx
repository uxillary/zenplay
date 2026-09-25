import type { ReactNode } from 'react'

export const GameToolbar = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Game controls">{children}</div>
)
