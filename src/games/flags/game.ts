import type { GameDefinition } from '../../app/gameRegistry'

export const FLAGS_GAME = {
  id: 'flags',
  name: 'Flags',
  description: 'Recognise flags from around the world, one at a time.',
} as const satisfies Pick<GameDefinition, 'id' | 'name' | 'description'>
