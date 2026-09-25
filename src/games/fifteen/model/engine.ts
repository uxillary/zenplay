import { FIFTEEN_TILE_COUNT, type FifteenState } from './types.ts'

export const createSolvedFifteenState = (): FifteenState => ({
  tiles: [...Array.from({ length: 15 }, (_, index) => index + 1), null],
  moves: 0,
})

export const isFifteenSolved = (state: Pick<FifteenState, 'tiles'>): boolean =>
  state.tiles.length === FIFTEEN_TILE_COUNT
  && state.tiles.slice(0, 15).every((tile, index) => tile === index + 1)
  && state.tiles[15] === null

const areAdjacent = (a: number, b: number): boolean =>
  Math.abs(Math.floor(a / 4) - Math.floor(b / 4)) + Math.abs((a % 4) - (b % 4)) === 1

export const moveFifteenTile = (state: FifteenState, tileIndex: number): FifteenState => {
  const emptyIndex = state.tiles.indexOf(null)
  if (!Number.isInteger(tileIndex) || tileIndex < 0 || tileIndex >= FIFTEEN_TILE_COUNT || emptyIndex < 0 || !areAdjacent(tileIndex, emptyIndex) || state.tiles[tileIndex] === null) return state
  const tiles = [...state.tiles]
  tiles[emptyIndex] = tiles[tileIndex]
  tiles[tileIndex] = null
  return { tiles, moves: state.moves + 1 }
}

export const isFifteenSolvable = (tiles: readonly (number | null)[]): boolean => {
  if (tiles.length !== FIFTEEN_TILE_COUNT) return false
  let inversions = 0
  const numbers = tiles.filter((tile): tile is number => tile !== null)
  for (let i = 0; i < numbers.length; i += 1) {
    for (let j = i + 1; j < numbers.length; j += 1) if (numbers[i] > numbers[j]) inversions += 1
  }
  const emptyIndex = tiles.indexOf(null)
  if (emptyIndex < 0) return false
  const emptyRowFromBottom = 4 - Math.floor(emptyIndex / 4)
  return (inversions + emptyRowFromBottom) % 2 === 1
}

export const createShuffledFifteenState = (random: () => number = Math.random, shuffleMoves = 100): FifteenState => {
  let state = createSolvedFifteenState()
  let previousEmpty = -1
  const steps = Math.max(3, Math.floor(shuffleMoves))
  for (let step = 0; step < steps; step += 1) {
    const emptyIndex = state.tiles.indexOf(null)
    const candidates = state.tiles.flatMap((tile, index) => tile !== null && areAdjacent(index, emptyIndex) && index !== previousEmpty ? [index] : [])
    const choice = candidates[Math.floor(Math.min(0.999999, Math.max(0, random())) * candidates.length)]
    const next = moveFifteenTile(state, choice)
    previousEmpty = emptyIndex
    state = next
  }
  while (isFifteenSolved(state)) {
    const emptyIndex = state.tiles.indexOf(null)
    const candidates = state.tiles.flatMap((tile, index) => tile !== null && areAdjacent(index, emptyIndex) && index !== previousEmpty ? [index] : [])
    const next = moveFifteenTile(state, candidates[0])
    previousEmpty = emptyIndex
    state = next
  }
  if (getFifteenManhattanDistance(state.tiles) < 3) {
    state = createSolvedFifteenState()
    for (const index of [14, 13, 9]) state = moveFifteenTile(state, index)
  }
  return { ...state, moves: 0 }
}

export const getFifteenManhattanDistance = (tiles: readonly (number | null)[]): number => tiles.reduce<number>((total, tile, index) => {
  if (tile === null) return total
  const target = tile - 1
  return total + Math.abs(Math.floor(index / 4) - Math.floor(target / 4)) + Math.abs(index % 4 - target % 4)
}, 0)

export const canMoveFifteenTile = (state: Pick<FifteenState, 'tiles'>, index: number): boolean => {
  const emptyIndex = state.tiles.indexOf(null)
  return index >= 0 && index < FIFTEEN_TILE_COUNT && state.tiles[index] !== null && emptyIndex >= 0 && areAdjacent(index, emptyIndex)
}
