import type { GameId } from '../app/gameRegistry'

/** Static, fictional M13C fixtures. Never persist or treat these as entitlements. */
export type DemoSupporter = {
  id: string
  displayName: string
  lifetimeStars: number
  favouriteGameId: GameId
  statistic: string
  supporterSince: number
  flair: string
}

export const demoSupporters: readonly DemoSupporter[] = [
  {
    id: 'demo-player-cedar',
    displayName: 'Demo Player Cedar',
    lifetimeStars: 14,
    favouriteGameId: 'solitaire',
    statistic: '327 Solitaire games completed',
    supporterSince: 2026,
    flair: 'Card-table accent example',
  },
  {
    id: 'demo-player-fern',
    displayName: 'Demo Player Fern',
    lifetimeStars: 1,
    favouriteGameId: 'sudoku',
    statistic: '48 Sudoku puzzles completed',
    supporterSince: 2026,
    flair: 'Supporter badge example',
  },
  {
    id: 'demo-player-oak',
    displayName: 'Demo Player Oak',
    lifetimeStars: 1247,
    favouriteGameId: 'mahjong',
    statistic: '63 Mahjong boards completed',
    supporterSince: 2025,
    flair: 'Profile border example',
  },
]

export const demoSupportMilestones = [
  { stars: 1, name: 'Supporter badge', description: 'A simple thank-you mark.' },
  { stars: 5, name: 'Profile accent', description: 'A small optional profile detail.' },
  { stars: 10, name: 'Solitaire card back', description: 'A visual card-back option.' },
  { stars: 25, name: 'Table appearance', description: 'An optional felt colour.' },
] as const

export const demoSupportAmounts = [1, 5, 10, 25] as const
