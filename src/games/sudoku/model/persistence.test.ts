import assert from 'node:assert/strict'
import test from 'node:test'
import { createSudokuState, toggleNote } from './engine.ts'
import { SUDOKU_PUZZLES } from './puzzles.ts'
import { isSudokuState, restoreSudokuState, serializeSudokuState } from './persistence.ts'

test('save serialization restores puzzle identity, notes, options, and undo history', () => {
  const puzzle = SUDOKU_PUZZLES[0]
  const cell = puzzle.givens.findIndex((value) => value === 0)
  const state = toggleNote(createSudokuState(puzzle.id, false), cell, 4)
  const restored = restoreSudokuState(JSON.parse(JSON.stringify(serializeSudokuState(state))))
  assert.deepEqual(restored, state)
  assert.deepEqual(restored?.history, state.history)
})

test('rejects unknown puzzles, altered givens, and malformed notes', () => {
  const state = createSudokuState(SUDOKU_PUZZLES[0].id)
  assert.equal(isSudokuState(state), true)
  assert.equal(restoreSudokuState({ ...state, puzzleId: 'unknown' }), null)
  const badGiven = structuredClone(state)
  const givenCell = SUDOKU_PUZZLES[0].givens.findIndex((value) => value > 0)
  badGiven.values[givenCell] = 0
  assert.equal(restoreSudokuState(badGiven), null)
  const badNotes = structuredClone(state)
  badNotes.notes[0] = [0, 12, 12]
  assert.equal(restoreSudokuState(badNotes), null)
})
