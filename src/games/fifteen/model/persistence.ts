import { isFifteenSolvable } from './engine.ts'
import type { FifteenState } from './types.ts'

export const isFifteenState = (value: unknown): value is FifteenState => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const state = value as Record<string, unknown>
  if (!Array.isArray(state.tiles) || state.tiles.length !== 16 || !Number.isSafeInteger(state.moves) || (state.moves as number) < 0) return false
  if (state.tiles.filter((tile) => tile === null).length !== 1) return false
  const tiles = state.tiles
  if (!tiles.every((tile) => tile === null || typeof tile === 'number' && Number.isInteger(tile) && tile >= 1 && tile <= 15)) return false
  if (new Set(tiles.filter((tile): tile is number => typeof tile === 'number')).size !== 15) return false
  return isFifteenSolvable(tiles as Array<number | null>)
}

export const serializeFifteenState = (state: FifteenState): FifteenState => ({ tiles: [...state.tiles], moves: state.moves })
export const restoreFifteenState = (value: unknown): FifteenState | null => isFifteenState(value) ? serializeFifteenState(value) : null
