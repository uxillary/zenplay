import { findSudokuPuzzle } from './puzzles.ts'
import type { SudokuSnapshot, SudokuState } from './types.ts'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isDigit = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 9

const isSnapshot = (value: unknown, givens: readonly number[]): value is SudokuSnapshot => {
  if (!isRecord(value)) return false
  const values = value.values
  const notesByCell = value.notes
  const lastHintedCell = value.lastHintedCell
  if (!Array.isArray(values) || values.length !== 81 || !values.every(isDigit)) return false
  if (!values.every((digit, index) => givens[index] === 0 || digit === givens[index])) return false
  if (!Array.isArray(notesByCell) || notesByCell.length !== 81) return false
  if (!notesByCell.every((notes, index) =>
    Array.isArray(notes)
    && notes.every((digit) => isDigit(digit) && digit >= 1)
    && new Set(notes).size === notes.length
    && (givens[index] === 0 && values[index] === 0 || notes.length === 0),
  )) return false
  return lastHintedCell === null || (Number.isInteger(lastHintedCell) && (lastHintedCell as number) >= 0 && (lastHintedCell as number) < 81)
}

export const isSudokuState = (value: unknown): value is SudokuState => {
  if (!isRecord(value) || typeof value.puzzleId !== 'string' || typeof value.showMistakes !== 'boolean') return false
  const puzzle = findSudokuPuzzle(value.puzzleId)
  if (!puzzle || value.difficulty !== puzzle.difficulty) return false
  const history = value.history
  if (!isSnapshot(value, puzzle.givens)) return false
  return Array.isArray(history)
    && history.length <= 10000
    && history.every((snapshot) => isSnapshot(snapshot, puzzle.givens))
}

export const serializeSudokuState = (state: SudokuState): SudokuState =>
  JSON.parse(JSON.stringify(state)) as SudokuState

export const restoreSudokuState = (value: unknown): SudokuState | null => {
  if (!isSudokuState(value)) return null
  const copy = (snapshot: SudokuSnapshot): SudokuSnapshot => ({
    values: [...snapshot.values],
    notes: snapshot.notes.map((notes) => [...notes]),
    lastHintedCell: snapshot.lastHintedCell,
  })
  return {
    puzzleId: value.puzzleId,
    difficulty: value.difficulty,
    showMistakes: value.showMistakes,
    ...copy(value),
    history: value.history.map(copy),
  }
}
