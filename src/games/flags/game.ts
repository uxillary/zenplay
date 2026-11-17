import type { GameSummary } from '../../app/gameCatalogue'

export const FLAGS_GAME = {
  id: 'flags',
  name: 'Flags',
  description: 'Recognise flags from around the world, one at a time.',
} as const satisfies Pick<GameSummary, 'id' | 'name' | 'description'>
