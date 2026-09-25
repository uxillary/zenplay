import { findSudokuPuzzle } from './puzzles.ts'
import type { SudokuSnapshot, SudokuState } from './types.ts'

const snapshot = (state: SudokuState): SudokuSnapshot => ({
  values: [...state.values],
  notes: state.notes.map((notes) => [...notes]),
  lastHintedCell: state.lastHintedCell,
})

const commit = (state: SudokuState, next: SudokuSnapshot): SudokuState => ({
  ...state,
  ...next,
  history: [...state.history, snapshot(state)],
})

export const createSudokuState = (puzzleId: string, showMistakes = true): SudokuState => {
  const puzzle = findSudokuPuzzle(puzzleId)
  if (!puzzle) throw new Error(`Unknown Sudoku puzzle: ${puzzleId}`)
  return {
    puzzleId,
    difficulty: puzzle.difficulty,
    values: [...puzzle.givens],
    notes: Array.from({ length: 81 }, () => []),
    lastHintedCell: null,
    showMistakes,
    history: [],
  }
}

export const enterValue = (state: SudokuState, cell: number, value: number): SudokuState => {
  const puzzle = findSudokuPuzzle(state.puzzleId)
  if (!puzzle || !Number.isInteger(cell) || cell < 0 || cell >= 81 || puzzle.givens[cell] !== 0 || !Number.isInteger(value) || value < 1 || value > 9) return state
  if (state.values[cell] === value && state.notes[cell].length === 0) return state
  const values = [...state.values]
  values[cell] = value
  const notes = state.notes.map((cellNotes, index) => index === cell ? [] : [...cellNotes])
  return commit(state, { values, notes, lastHintedCell: null })
}

export const eraseCell = (state: SudokuState, cell: number): SudokuState => {
  const puzzle = findSudokuPuzzle(state.puzzleId)
  if (!puzzle || !Number.isInteger(cell) || cell < 0 || cell >= 81 || puzzle.givens[cell] !== 0) return state
  if (state.values[cell] === 0 && state.notes[cell].length === 0) return state
  const values = [...state.values]
  values[cell] = 0
  const notes = state.notes.map((cellNotes, index) => index === cell ? [] : [...cellNotes])
  return commit(state, { values, notes, lastHintedCell: state.lastHintedCell === cell ? null : state.lastHintedCell })
}

export const toggleNote = (state: SudokuState, cell: number, value: number): SudokuState => {
  const puzzle = findSudokuPuzzle(state.puzzleId)
  if (!puzzle || !Number.isInteger(cell) || cell < 0 || cell >= 81 || puzzle.givens[cell] !== 0 || state.values[cell] !== 0 || !Number.isInteger(value) || value < 1 || value > 9) return state
  const current = state.notes[cell]
  const updated = current.includes(value) ? current.filter((note) => note !== value) : [...current, value].sort((a, b) => a - b)
  const notes = state.notes.map((cellNotes, index) => index === cell ? updated : [...cellNotes])
  return commit(state, { values: [...state.values], notes, lastHintedCell: null })
}

export const fillHint = (state: SudokuState): SudokuState => {
  const puzzle = findSudokuPuzzle(state.puzzleId)
  if (!puzzle) return state
  const cell = state.values.findIndex((value, index) => value !== puzzle.solution[index] && puzzle.givens[index] === 0)
  if (cell < 0) return state
  const values = [...state.values]
  values[cell] = puzzle.solution[cell]
  const notes = state.notes.map((cellNotes, index) => index === cell ? [] : [...cellNotes])
  return commit(state, { values, notes, lastHintedCell: cell })
}

export const undoSudoku = (state: SudokuState): SudokuState => {
  const previous = state.history.at(-1)
  if (!previous) return state
  return {
    ...state,
    ...previous,
    history: state.history.slice(0, -1),
  }
}

export const setShowMistakes = (state: SudokuState, showMistakes: boolean): SudokuState =>
  state.showMistakes === showMistakes ? state : { ...state, showMistakes }
