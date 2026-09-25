import { SUDOKU_CELL_COUNT, SUDOKU_SIZE, type SudokuPuzzle, type SudokuState } from './types.ts'

export const getRowIndices = (cell: number): number[] => {
  const row = Math.floor(cell / SUDOKU_SIZE)
  return Array.from({ length: SUDOKU_SIZE }, (_, column) => row * SUDOKU_SIZE + column)
}

export const getColumnIndices = (cell: number): number[] => {
  const column = cell % SUDOKU_SIZE
  return Array.from({ length: SUDOKU_SIZE }, (_, row) => row * SUDOKU_SIZE + column)
}

export const getBoxIndices = (cell: number): number[] => {
  const rowStart = Math.floor(Math.floor(cell / SUDOKU_SIZE) / 3) * 3
  const columnStart = Math.floor((cell % SUDOKU_SIZE) / 3) * 3
  return Array.from({ length: 9 }, (_, offset) =>
    (rowStart + Math.floor(offset / 3)) * SUDOKU_SIZE + columnStart + offset % 3,
  )
}

const hasNoDuplicates = (values: readonly number[]): boolean => {
  const filled = values.filter((value) => value !== 0)
  return new Set(filled).size === filled.length
}

export const isValidPlacement = (values: readonly number[], cell: number, value: number): boolean => {
  if (values.length !== SUDOKU_CELL_COUNT || !Number.isInteger(cell) || cell < 0 || cell >= SUDOKU_CELL_COUNT) return false
  if (!Number.isInteger(value) || value < 1 || value > 9) return false
  return hasNoDuplicates(getRowIndices(cell).filter((index) => index !== cell).map((index) => values[index]).concat(value))
    && hasNoDuplicates(getColumnIndices(cell).filter((index) => index !== cell).map((index) => values[index]).concat(value))
    && hasNoDuplicates(getBoxIndices(cell).filter((index) => index !== cell).map((index) => values[index]).concat(value))
}

const unitsAreValid = (values: readonly number[]): boolean => {
  for (let index = 0; index < SUDOKU_SIZE; index += 1) {
    if (!hasNoDuplicates(getRowIndices(index * SUDOKU_SIZE).map((cell) => values[cell]))) return false
    if (!hasNoDuplicates(getColumnIndices(index).map((cell) => values[cell]))) return false
  }
  for (let row = 0; row < 9; row += 3) {
    for (let column = 0; column < 9; column += 3) {
      const start = row * 9 + column
      if (!hasNoDuplicates(getBoxIndices(start).map((cell) => values[cell]))) return false
    }
  }
  return true
}

export const isCompleteSolution = (values: readonly number[]): boolean =>
  values.length === SUDOKU_CELL_COUNT
  && values.every((value) => Number.isInteger(value) && value >= 1 && value <= 9)
  && unitsAreValid(values)

export const isValidPuzzle = (givens: readonly number[], solution: readonly number[]): boolean =>
  givens.length === SUDOKU_CELL_COUNT
  && isCompleteSolution(solution)
  && givens.every((value, index) => Number.isInteger(value) && value >= 0 && value <= 9 && (value === 0 || value === solution[index]))
  && unitsAreValid(givens)

export const countSolutions = (givens: readonly number[], limit = 2): number => {
  if (givens.length !== SUDOKU_CELL_COUNT || !givens.every((value) => Number.isInteger(value) && value >= 0 && value <= 9) || !unitsAreValid(givens)) return 0
  const grid = [...givens]
  let count = 0
  const search = (): void => {
    if (count >= limit) return
    let cell = -1
    let candidates: number[] = []
    for (let index = 0; index < SUDOKU_CELL_COUNT; index += 1) {
      if (grid[index] !== 0) continue
      const options = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((value) => isValidPlacement(grid, index, value))
      if (options.length === 0) return
      if (cell < 0 || options.length < candidates.length) {
        cell = index
        candidates = options
        if (options.length === 1) break
      }
    }
    if (cell < 0) {
      count += 1
      return
    }
    for (const candidate of candidates) {
      grid[cell] = candidate
      search()
      grid[cell] = 0
      if (count >= limit) return
    }
  }
  search()
  return count
}

export const getConflictingCells = (values: readonly number[]): Set<number> => {
  const conflicts = new Set<number>()
  const checkUnit = (indices: number[]) => {
    const byValue = new Map<number, number[]>()
    for (const index of indices) {
      const value = values[index]
      if (!value) continue
      byValue.set(value, [...(byValue.get(value) ?? []), index])
    }
    byValue.forEach((cells) => {
      if (cells.length > 1) cells.forEach((cell) => conflicts.add(cell))
    })
  }
  if (values.length !== SUDOKU_CELL_COUNT) return conflicts
  for (let row = 0; row < 9; row += 1) checkUnit(getRowIndices(row * 9))
  for (let column = 0; column < 9; column += 1) checkUnit(getColumnIndices(column))
  for (let row = 0; row < 9; row += 3) {
    for (let column = 0; column < 9; column += 3) checkUnit(getBoxIndices(row * 9 + column))
  }
  return conflicts
}

export const isSudokuComplete = (state: SudokuState, puzzle: SudokuPuzzle): boolean =>
  state.values.every((value, index) => value === puzzle.solution[index])
  && isCompleteSolution(state.values)
