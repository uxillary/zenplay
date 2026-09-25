export type SudokuDifficulty = 'easy' | 'medium' | 'hard'

export type SudokuPuzzle = {
  id: string
  difficulty: SudokuDifficulty
  givens: number[]
  solution: number[]
}

export type SudokuSnapshot = {
  values: number[]
  notes: number[][]
  lastHintedCell: number | null
}

export type SudokuState = SudokuSnapshot & {
  puzzleId: string
  difficulty: SudokuDifficulty
  showMistakes: boolean
  history: SudokuSnapshot[]
}

export const SUDOKU_SIZE = 9
export const SUDOKU_CELL_COUNT = SUDOKU_SIZE * SUDOKU_SIZE
export const SUDOKU_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const
