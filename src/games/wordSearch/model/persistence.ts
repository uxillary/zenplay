import { findWordSearchPuzzle, validateWordSearchPuzzle } from './puzzles.ts'
import type { WordSearchPuzzle, WordSearchState } from './types.ts'

export const isWordSearchState = (value: unknown): value is WordSearchState => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const state = value as Record<string, unknown>
  if (typeof state.puzzleId !== 'string' || !Array.isArray(state.foundWords) || !state.foundWords.every((word) => typeof word === 'string')) return false
  const puzzle = findWordSearchPuzzle(state.puzzleId)
  return Boolean(puzzle && validateWordSearchPuzzle(puzzle) && new Set(state.foundWords).size === state.foundWords.length && state.foundWords.every((word) => puzzle.words.some((target) => target.word === word)))
}

export const serializeWordSearchState = (state: WordSearchState): WordSearchState => ({ puzzleId: state.puzzleId, foundWords: [...state.foundWords] })
export const restoreWordSearchState = (value: unknown): WordSearchState | null => isWordSearchState(value) ? serializeWordSearchState(value) : null
export const isValidWordSearchPuzzle = (puzzle: unknown): puzzle is WordSearchPuzzle => validateWordSearchPuzzle(puzzle)

