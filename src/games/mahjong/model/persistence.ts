import { CLASSIC_TURTLE_LAYOUT } from './engine.ts'
import type { MahjongState, MahjongTile } from './types.ts'

const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const families = ['characters', 'bamboo', 'dots', 'winds', 'dragons', 'flowers', 'seasons']
const allowedKeys = new Set([
  ...['characters', 'bamboo', 'dots'].flatMap((family) => Array.from({ length: 9 }, (_, i) => `${family}-${i + 1}`)),
  ...['east', 'south', 'west', 'north'].map((wind) => `wind-${wind}`),
  ...['red', 'green', 'white'].map((dragon) => `dragon-${dragon}`),
  'flowers', 'seasons',
])
const positionKey = (x: number, y: number, z: number) => `${x}:${y}:${z}`
const expectedPositions = new Set(CLASSIC_TURTLE_LAYOUT.map(({ x, y, z }) => positionKey(x, y, z)))
export const isMahjongState = (value: unknown): value is MahjongState => {
  if (!record(value) || !Array.isArray(value.tiles) || value.tiles.length !== CLASSIC_TURTLE_LAYOUT.length) return false
  if (!Array.isArray(value.removedPairs) || !Number.isSafeInteger(value.moves) || (value.moves as number) < 0 || typeof value.accessibleLabels !== 'boolean') return false
  const ids = new Set<string>()
  const keys = new Map<string, number>()
  const positions = new Set<string>()
  for (const item of value.tiles) {
    if (!record(item) || typeof item.id !== 'string' || ids.has(item.id) || !families.includes(String(item.family)) || typeof item.matchKey !== 'string' || !('value' in item) || ![item.x, item.y, item.z].every(Number.isFinite) || typeof item.removed !== 'boolean') return false
    if (!allowedKeys.has(item.matchKey) || positions.has(positionKey(item.x as number, item.y as number, item.z as number))) return false
    const expectedKey = item.family === 'winds' ? `wind-${String(item.value)}`
      : item.family === 'dragons' ? `dragon-${String(item.value)}`
        : item.family === 'flowers' || item.family === 'seasons' ? item.family
          : `${String(item.family)}-${String(item.value)}`
    if (item.matchKey !== expectedKey) return false
    ids.add(item.id)
    positions.add(positionKey(item.x as number, item.y as number, item.z as number))
    keys.set(item.matchKey, (keys.get(item.matchKey) ?? 0) + 1)
  }
  if (positions.size !== expectedPositions.size || [...positions].some((position) => !expectedPositions.has(position))) return false
  if (keys.size !== 36 || [...keys.values()].some((count) => count !== 4)) return false
  const removed = new Set<string>()
  for (const pair of value.removedPairs) {
    if (!Array.isArray(pair) || pair.length !== 2 || pair.some((id) => typeof id !== 'string' || !ids.has(id) || removed.has(id))) return false
    const tiles = value.tiles as MahjongTile[]
    if (tiles.find((tile) => tile.id === pair[0])?.matchKey !== tiles.find((tile) => tile.id === pair[1])?.matchKey) return false
    pair.forEach((id) => removed.add(id as string))
  }
  if (value.moves !== value.removedPairs.length) return false
  return value.tiles.every((tile) => (tile as MahjongTile).removed === removed.has((tile as MahjongTile).id))
}
export const serializeMahjongState = (state: MahjongState): MahjongState => JSON.parse(JSON.stringify(state)) as MahjongState
export const restoreMahjongState = (value: unknown): MahjongState | null => isMahjongState(value) ? serializeMahjongState(value) : null
