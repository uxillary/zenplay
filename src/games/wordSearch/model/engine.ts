import type { WordSearchCell, WordSearchPuzzle, WordSearchState } from './types.ts'

export const createWordSearchState = (puzzleId: string): WordSearchState => ({ puzzleId, foundWords: [] })

export const getWordPath = (start: WordSearchCell, end: WordSearchCell): WordSearchCell[] | null => {
  const dr = end.row - start.row
  const dc = end.column - start.column
  const length = Math.max(Math.abs(dr), Math.abs(dc))
  if (length === 0 || (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc))) return null
  const stepRow = Math.sign(dr)
  const stepColumn = Math.sign(dc)
  return Array.from({ length: length + 1 }, (_, index) => ({ row: start.row + index * stepRow, column: start.column + index * stepColumn }))
}

export const selectWord = (puzzle: WordSearchPuzzle, state: WordSearchState, start: WordSearchCell, end: WordSearchCell): { state: WordSearchState; result: 'found' | 'already-found' | 'invalid' | 'complete'; word?: string } => {
  const path = getWordPath(start, end)
  if (!path || path.some(({ row, column }) => row < 0 || row >= puzzle.grid.length || column < 0 || column >= puzzle.grid[row].length)) return { state, result: 'invalid' }
  const word = puzzle.words.find(({ cells }) => cells.length === path.length && cells.every((cell, index) => cell.row === path[index].row && cell.column === path[index].column) || cells.length === path.length && cells.every((cell, index) => cell.row === path[path.length - 1 - index].row && cell.column === path[path.length - 1 - index].column))
  if (!word) return { state, result: 'invalid' }
  if (state.foundWords.includes(word.word)) return { state, result: 'already-found', word: word.word }
  const next = { ...state, foundWords: [...state.foundWords, word.word] }
  return { state: next, result: next.foundWords.length === puzzle.words.length ? 'complete' : 'found', word: word.word }
}

export const getWordSearchHint = (puzzle: WordSearchPuzzle, state: WordSearchState) => puzzle.words.find(({ word }) => !state.foundWords.includes(word))?.cells[0] ?? null
export const isWordSearchComplete = (puzzle: WordSearchPuzzle, state: WordSearchState) => puzzle.words.length > 0 && puzzle.words.every(({ word }) => state.foundWords.includes(word))

