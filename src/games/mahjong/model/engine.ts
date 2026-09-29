import type { MahjongFamily, MahjongState, MahjongTile } from './types.ts'

export type MahjongSlot = Pick<MahjongTile, 'x' | 'y' | 'z'>

// One elevation shifts a tile by a small fraction of its footprint. These are
// logical board units shared by rendering and collision checks, not pixel math.
export const MAHJONG_LAYER_STEP = 0.27
export const MAHJONG_TILE_FOOTPRINT = 1
const MIN_BLOCKING_OVERLAP = 0.1

export const getMahjongTilePosition = (tile: MahjongSlot) => ({
  x: tile.x + tile.z * MAHJONG_LAYER_STEP,
  y: tile.y - tile.z * MAHJONG_LAYER_STEP,
})

export const getMahjongElevations = (tiles: readonly MahjongSlot[]): number[] => [...new Set(tiles.map(({ z }) => z))].sort((a, b) => a - b)
export const getMahjongRaisedElevations = (tiles: readonly MahjongSlot[]): number[] => getMahjongElevations(tiles).slice(1)

const footprint = (tile: MahjongSlot) => {
  const { x, y } = getMahjongTilePosition(tile)
  return { left: x, top: y, right: x + MAHJONG_TILE_FOOTPRINT, bottom: y + MAHJONG_TILE_FOOTPRINT }
}

const overlap = (aStart: number, aEnd: number, bStart: number, bEnd: number) => Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart))
const touches = (a: number, b: number) => Math.abs(a - b) < 0.000001

const positionIsFree = (slot: MahjongSlot, occupied: readonly MahjongSlot[]): boolean => {
  const target = footprint(slot)
  const others = occupied.filter((other) => other !== slot).map((other) => ({ tile: other, bounds: footprint(other) }))
  const covered = others.some(({ tile, bounds }) => tile.z > slot.z
    && overlap(target.left, target.right, bounds.left, bounds.right) > MIN_BLOCKING_OVERLAP
    && overlap(target.top, target.bottom, bounds.top, bounds.bottom) > MIN_BLOCKING_OVERLAP)
  const leftBlocked = others.some(({ tile, bounds }) => tile.z === slot.z && touches(bounds.right, target.left)
    && overlap(target.top, target.bottom, bounds.top, bounds.bottom) > MIN_BLOCKING_OVERLAP)
  const rightBlocked = others.some(({ tile, bounds }) => tile.z === slot.z && touches(bounds.left, target.right)
    && overlap(target.top, target.bottom, bounds.top, bounds.bottom) > MIN_BLOCKING_OVERLAP)
  return !covered && (!leftBlocked || !rightBlocked)
}

// The legacy footprint is retained only to migrate saved M13A/M13C games.
const rectangle = (width: number, height: number, z: number, xOffset = 0, yOffset = 0): MahjongSlot[] =>
  Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => ({ x: x + xOffset, y: y + yOffset, z }))).flat()

export const LEGACY_CLASSIC_TURTLE_LAYOUT: readonly MahjongSlot[] = [
  ...rectangle(12, 8, 0),
  ...rectangle(8, 4, 1, 2, 2),
  ...rectangle(4, 2, 2, 4, 3),
  ...rectangle(2, 1, 3, 5, 3),
  ...rectangle(3, 1, 0, -3, 3),
  ...rectangle(3, 1, 0, 12, 3),
].flat()

// Rows taper around the shell and spine. The broad z0 shoulders incorporate
// the characteristic wings into the foundation instead of leaving loose rows.
const centeredRows = (widths: readonly number[], z: number, yOffset: number, centerX = 6): MahjongSlot[] =>
  widths.flatMap((width, row) => Array.from({ length: width }, (_, column) => ({
    x: centerX - width / 2 + column,
    y: yOffset + row,
    z,
  })))

export const CLASSIC_TURTLE_LAYOUT: readonly MahjongSlot[] = [
  ...centeredRows([9, 11, 13, 18, 18, 13, 11, 9], 0, 0),
  ...centeredRows([6, 10, 10, 6], 1, 2),
  ...centeredRows([3, 5], 2, 3),
  ...centeredRows([2], 3, 3),
]

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

const slotIsFree = (slot: MahjongSlot, remaining: MahjongSlot[]): boolean => positionIsFree(slot, remaining)

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
  return { tiles, removedPairs: [], moves: 0, accessibleLabels: false, freeHints: 0, rewardedLayers: [] }
}

export const isMahjongTileFree = (tile: MahjongTile, tiles: readonly MahjongTile[]): boolean => {
  if (tile.removed) return false
  return positionIsFree(tile, tiles.filter((item) => !item.removed && item.id !== tile.id))
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
  const tiles = state.tiles.map((tile) => tile.id === firstId || tile.id === secondId ? { ...tile, removed: true } : tile)
  const newlyCleared = getMahjongRaisedElevations(tiles)
    .filter((elevation) => !state.rewardedLayers.includes(elevation)
      && !tiles.some((tile) => tile.z === elevation && !tile.removed))
  return {
    ...state,
    tiles,
    removedPairs: [...state.removedPairs, [firstId, secondId]],
    moves: state.moves + 1,
    freeHints: state.freeHints + newlyCleared.length,
    rewardedLayers: [...state.rewardedLayers, ...newlyCleared],
  }
}
export const undoMahjong = (state: MahjongState): MahjongState => {
  const pair = state.removedPairs.at(-1)
  if (!pair) return state
  return { ...state, tiles: state.tiles.map((tile) => pair.includes(tile.id) ? { ...tile, removed: false } : tile), removedPairs: state.removedPairs.slice(0, -1), moves: Math.max(0, state.moves - 1) }
}

/** Performs the existing first-pair hint and spends one earned hint only on success. */
export const applyMahjongHint = (state: MahjongState): { state: MahjongState; pair: [string, string] | null } => {
  const pair = getAvailableMahjongPairs(state)[0] ?? null
  if (!pair || state.freeHints === 0) return { state, pair }
  return { state: { ...state, freeHints: state.freeHints - 1 }, pair }
}
