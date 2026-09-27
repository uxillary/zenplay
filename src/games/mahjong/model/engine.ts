import type { MahjongFamily, MahjongState, MahjongTile } from './types.ts'

export type MahjongSlot = Pick<MahjongTile, 'x' | 'y' | 'z'>

// The declarative layers use tile-sized grid coordinates. Wider lower rows form
// the turtle shell; the centered upper layers make its back and raised spine.
const rectangle = (width: number, height: number, z: number, xOffset = 0, yOffset = 0): MahjongSlot[] =>
  Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => ({ x: x + xOffset, y: y + yOffset, z }))).flat()

export const CLASSIC_TURTLE_LAYOUT: readonly MahjongSlot[] = [
  ...rectangle(12, 8, 0),
  ...rectangle(8, 4, 1, 2, 2),
  ...rectangle(4, 2, 2, 4, 3),
  ...rectangle(2, 1, 3, 5, 3),
  ...rectangle(3, 1, 0, -3, 3),
  ...rectangle(3, 1, 0, 12, 3),
].flat()

type Face = { family: MahjongFamily; value: number | string; matchKey: string }

const STANDARD_FACES: Face[] = [
  ...(['characters', 'bamboo', 'dots'] as const).flatMap((family) => Array.from({ length: 9 }, (_, i) => ({ family, value: i + 1, matchKey: `${family}-${i + 1}` }))),
  ...['east', 'south', 'west', 'north'].map((value) => ({ family: 'winds' as const, value, matchKey: `wind-${value}` })),
  ...['red', 'green', 'white'].map((value) => ({ family: 'dragons' as const, value, matchKey: `dragon-${value}` })),
]
const SPECIAL_FACES: Face[] = [
  ...['plum', 'orchid', 'chrysanthemum', 'bamboo'].map((value) => ({ family: 'flowers' as const, value, matchKey: 'flowers' })),
  ...['spring', 'summer', 'autumn', 'winter'].map((value) => ({ family: 'seasons' as const, value, matchKey: 'seasons' })),
]

const shuffled = <T,>(items: T[], random: () => number): T[] => {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const value = random()
    const r = Number.isFinite(value) ? Math.max(0, Math.min(0.999999, value)) : 0
    const j = Math.floor(r * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

const slotIsFree = (slot: MahjongSlot, remaining: MahjongSlot[]): boolean => {
  const covered = remaining.some((other) => other.z > slot.z && Math.abs(other.x - slot.x) < 1 && Math.abs(other.y - slot.y) < 1)
  const leftBlocked = remaining.some((other) => other.z === slot.z && other.y === slot.y && other.x === slot.x - 1)
  const rightBlocked = remaining.some((other) => other.z === slot.z && other.y === slot.y && other.x === slot.x + 1)
  return !covered && (!leftBlocked || !rightBlocked)
}

export const createMahjongState = (random: () => number = Math.random): MahjongState => {
  const slots = CLASSIC_TURTLE_LAYOUT.map((slot) => ({ ...slot }))
  const pairedFaces = [
    ...STANDARD_FACES.flatMap((face) => [face, face]),
    { ...SPECIAL_FACES[0] }, { ...SPECIAL_FACES[1] },
    { ...SPECIAL_FACES[4] }, { ...SPECIAL_FACES[5] },
  ]
  const deal = shuffled(pairedFaces, random)
  // A reverse-removal deal guarantees a playable board: each pair is assigned
  // to two currently free positions, so removing pairs in reverse order wins.
  const remaining = [...slots]
  const assigned: Array<{ slot: MahjongSlot; face: Face }> = []
  let cursor = 0
  while (remaining.length) {
    const free = remaining.filter((slot) => slotIsFree(slot, remaining))
    if (free.length < 2) return createMahjongState(() => 0.5)
    const pairFace = deal[cursor]
    const selected = free.slice(0, 2)
    selected.forEach((slot) => {
      assigned.push({ slot, face: pairFace })
      remaining.splice(remaining.indexOf(slot), 1)
    })
    cursor += 1
  }
  const tiles = shuffled(assigned, random).map(({ slot, face }, index) => {
    return { ...slot, ...face, id: `tile-${index}`, removed: false }
  })
  return { tiles, removedPairs: [], moves: 0, accessibleLabels: false }
}

export const isMahjongTileFree = (tile: MahjongTile, tiles: readonly MahjongTile[]): boolean => {
  if (tile.removed) return false
  const remaining = tiles.filter((item) => !item.removed)
  const covered = remaining.some((other) => other.z > tile.z && Math.abs(other.x - tile.x) < 1 && Math.abs(other.y - tile.y) < 1)
  const leftBlocked = remaining.some((other) => other.id !== tile.id && other.z === tile.z && other.y === tile.y && other.x === tile.x - 1)
  const rightBlocked = remaining.some((other) => other.id !== tile.id && other.z === tile.z && other.y === tile.y && other.x === tile.x + 1)
  return !covered && (!leftBlocked || !rightBlocked)
}

export const canMahjongTilesMatch = (a: MahjongTile, b: MahjongTile): boolean => a.id !== b.id && a.matchKey === b.matchKey
export const getAvailableMahjongPairs = (state: MahjongState): [string, string][] => {
  const free = state.tiles.filter((tile) => isMahjongTileFree(tile, state.tiles))
  const pairs: [string, string][] = []
  for (let i = 0; i < free.length; i += 1) for (let j = i + 1; j < free.length; j += 1) {
    if (canMahjongTilesMatch(free[i], free[j])) pairs.push([free[i].id, free[j].id])
  }
  return pairs
}
export const isMahjongComplete = (state: MahjongState): boolean => state.tiles.every((tile) => tile.removed)
export const hasMahjongMoves = (state: MahjongState): boolean => getAvailableMahjongPairs(state).length > 0
export const removeMahjongPair = (state: MahjongState, firstId: string, secondId: string): MahjongState => {
  const first = state.tiles.find((tile) => tile.id === firstId)
  const second = state.tiles.find((tile) => tile.id === secondId)
  if (!first || !second || !isMahjongTileFree(first, state.tiles) || !isMahjongTileFree(second, state.tiles) || !canMahjongTilesMatch(first, second)) return state
  return { ...state, tiles: state.tiles.map((tile) => tile.id === firstId || tile.id === secondId ? { ...tile, removed: true } : tile), removedPairs: [...state.removedPairs, [firstId, secondId]], moves: state.moves + 1 }
}
export const undoMahjong = (state: MahjongState): MahjongState => {
  const pair = state.removedPairs.at(-1)
  if (!pair) return state
  return { ...state, tiles: state.tiles.map((tile) => pair.includes(tile.id) ? { ...tile, removed: false } : tile), removedPairs: state.removedPairs.slice(0, -1), moves: Math.max(0, state.moves - 1) }
}
