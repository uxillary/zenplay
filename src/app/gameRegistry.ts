import { hasResumableSolitaireSave } from '../games/solitaire/save'

export type GameId = 'solitaire'

export type GameDefinition = {
  id: GameId
  name: string
  description: string
  status: 'available' | 'coming-soon'
  target: `/${string}`
  supportsContinue?: boolean
  getContinueAvailability?: () => Promise<boolean>
}

export const games: readonly GameDefinition[] = [
  {
    id: 'solitaire',
    name: 'Solitaire',
    description: 'A familiar game of patience with a standard deck of cards.',
    status: 'available',
    target: '/games/solitaire',
    supportsContinue: true,
    getContinueAvailability: hasResumableSolitaireSave,
  },
]
