import assert from 'node:assert/strict'
import test from 'node:test'
import { SUDOKU_PUZZLES } from './puzzles.ts'
import { createSudokuState, enterValue, eraseCell, fillHint, setShowMistakes, toggleNote, undoSudoku } from './engine.ts'

const puzzle = SUDOKU_PUZZLES[0]
const emptyCell = puzzle.givens.findIndex((value) => value === 0)

test('enters and erases a value without mutating the original puzzle', () => {
  const state = createSudokuState(puzzle.id)
  const entered = enterValue(state, emptyCell, puzzle.solution[emptyCell])
  assert.equal(entered.values[emptyCell], puzzle.solution[emptyCell])
  assert.equal(state.values[emptyCell], 0)
  assert.deepEqual(undoSudoku(entered), state)
  assert.equal(eraseCell(entered, emptyCell).values[emptyCell], 0)
  assert.equal(eraseCell(state, emptyCell), state)
})

test('notes toggle individually, clear on value entry, and are undoable', () => {
  const state = createSudokuState(puzzle.id)
  const noted = toggleNote(state, emptyCell, 2)
  assert.deepEqual(noted.notes[emptyCell], [2])
  const twoNotes = toggleNote(noted, emptyCell, 3)
  assert.deepEqual(twoNotes.notes[emptyCell], [2, 3])
  const removed = toggleNote(twoNotes, emptyCell, 2)
  assert.deepEqual(removed.notes[emptyCell], [3])
  assert.deepEqual(undoSudoku(removed), twoNotes)
  const entered = enterValue(twoNotes, emptyCell, puzzle.solution[emptyCell])
  assert.deepEqual(entered.notes[emptyCell], [])
  assert.deepEqual(undoSudoku(entered), twoNotes)
  assert.deepEqual(eraseCell(twoNotes, emptyCell).notes[emptyCell], [])
})

test('hint fills an unsolved cell and Undo restores its previous value and notes', () => {
  const state = toggleNote(createSudokuState(puzzle.id), emptyCell, 9)
  const hinted = fillHint(state)
  assert.equal(hinted.values[emptyCell], puzzle.solution[emptyCell])
  assert.equal(hinted.lastHintedCell, emptyCell)
  assert.deepEqual(hinted.notes[emptyCell], [])
  assert.deepEqual(undoSudoku(hinted), state)
  const solved = { ...state, values: [...puzzle.solution] }
  assert.equal(fillHint(solved), solved)
})

test('Show mistakes is a persistent option and does not create an Undo step', () => {
  const state = createSudokuState(puzzle.id)
  const changed = setShowMistakes(state, false)
  assert.equal(changed.showMistakes, false)
  assert.equal(changed.history.length, 0)
  assert.equal(setShowMistakes(changed, false), changed)
})
