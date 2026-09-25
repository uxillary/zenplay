import { countSolutions, isCompleteSolution, isValidPuzzle } from './rules.ts'
import type { SudokuDifficulty, SudokuPuzzle } from './types.ts'

const basePuzzle = [
  '530070000', '600195000', '098000060',
  '800060003', '400803001', '700020006',
  '060000280', '000419005', '000080079',
].join('')

const baseSolution = [
  '534678912', '672195348', '198342567',
  '859761423', '426853791', '713924856',
  '961537284', '287419635', '345286179',
].join('')

const digits = (source: string): number[] => [...source].map(Number)
const solvedDigits = digits(baseSolution)
const puzzleDigits = digits(basePuzzle)
const missing = puzzleDigits.flatMap((value, index) => value === 0 ? [index] : [])
const baseClueCount = puzzleDigits.length - missing.length

const withClueCount = (clueCount: number): number[] => {
  const givens = [...puzzleDigits]
  for (const index of missing.slice(0, clueCount - baseClueCount)) {
    givens[index] = solvedDigits[index]
  }
  return givens
}

const transform = (values: number[], variant: number): number[] => {
  const result = Array<number>(81).fill(0)
  const rowOrder = variant % 2 === 0
    ? Array.from({ length: 9 }, (_, row) => row)
    : [3, 4, 5, 6, 7, 8, 0, 1, 2]
  const columnOrder = variant % 3 === 0
    ? Array.from({ length: 9 }, (_, column) => column)
    : [6, 7, 8, 0, 1, 2, 3, 4, 5]
  const digitShift = variant % 9
  rowOrder.forEach((sourceRow, row) => columnOrder.forEach((sourceColumn, column) => {
    const value = values[sourceRow * 9 + sourceColumn]
    result[row * 9 + column] = value === 0 ? 0 : ((value - 1 + digitShift) % 9) + 1
  }))
  return result
}

const sourceSet: Array<{ difficulty: SudokuDifficulty; clues: number }> = [
  { difficulty: 'easy', clues: 54 },
  { difficulty: 'medium', clues: 42 },
  { difficulty: 'hard', clues: 30 },
]

export const SUDOKU_PUZZLES: readonly SudokuPuzzle[] = sourceSet.flatMap(({ difficulty, clues }, index) =>
  [0, 1].map((variant) => {
    const givens = transform(withClueCount(clues), index * 2 + variant)
    const solution = transform(solvedDigits, index * 2 + variant)
    return { id: `${difficulty}-${variant + 1}`, difficulty, givens, solution }
  }),
)

export const findSudokuPuzzle = (id: string): SudokuPuzzle | undefined =>
  SUDOKU_PUZZLES.find((puzzle) => puzzle.id === id)

export const getPuzzleForNewGame = (difficulty: SudokuDifficulty, previousId?: string): SudokuPuzzle => {
  const matches = SUDOKU_PUZZLES.filter((puzzle) => puzzle.difficulty === difficulty)
  return matches.find((puzzle) => puzzle.id !== previousId) ?? matches[0]
}

export const validatePuzzleCollection = (): boolean => SUDOKU_PUZZLES.every((puzzle) =>
  isValidPuzzle(puzzle.givens, puzzle.solution)
  && isCompleteSolution(puzzle.solution)
  && countSolutions(puzzle.givens, 2) === 1,
)
