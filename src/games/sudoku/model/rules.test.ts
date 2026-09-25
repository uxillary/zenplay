import assert from 'node:assert/strict'
import test from 'node:test'
import { SUDOKU_PUZZLES, validatePuzzleCollection } from './puzzles.ts'
import { countSolutions, getBoxIndices, getColumnIndices, getConflictingCells, getRowIndices, isCompleteSolution, isSudokuComplete, isValidPlacement } from './rules.ts'
import { createSudokuState, enterValue } from './engine.ts'

test('rejects duplicate values in a row, column, and box', () => {
  const values = Array<number>(81).fill(0)
  values[1] = 5
  assert.equal(isValidPlacement(values, 0, 5), false)
  values.fill(0)
  values[9] = 6
  assert.equal(isValidPlacement(values, 0, 6), false)
  values.fill(0)
  values[10] = 7
  assert.equal(isValidPlacement(values, 0, 7), false)
  assert.equal(getRowIndices(10).length, 9)
  assert.equal(getColumnIndices(10).length, 9)
  assert.equal(getBoxIndices(10).length, 9)
})

test('detects duplicate conflicts across the complete row, column, and box units', () => {
  const values = Array<number>(81).fill(0)
  values[0] = 4
  values[1] = 4
  values[9] = 8
  values[18] = 8
  assert.deepEqual([...getConflictingCells(values)].sort((a, b) => a - b), [0, 1, 9, 18])
})

test('recognises a correct completed grid and rejects incomplete or invalid grids', () => {
  const puzzle = SUDOKU_PUZZLES.find(({ difficulty }) => difficulty === 'easy')!
  const state = createSudokuState(puzzle.id)
  assert.equal(isCompleteSolution(puzzle.solution), true)
  assert.equal(isSudokuComplete({ ...state, values: [...puzzle.solution] }, puzzle), true)
  assert.equal(isSudokuComplete(state, puzzle), false)
  const wrong = [...puzzle.solution]
  wrong[0] = wrong[1]
  assert.equal(isCompleteSolution(wrong), false)
})

test('all Easy, Medium, and Hard built-in puzzles are valid and uniquely solvable', () => {
  assert.equal(validatePuzzleCollection(), true)
  for (const difficulty of ['easy', 'medium', 'hard'] as const) {
    const puzzle = SUDOKU_PUZZLES.find((item) => item.difficulty === difficulty)!
    assert.equal(countSolutions(puzzle.givens, 2), 1)
    assert.equal(puzzle.givens.length, 81)
  }
})

test('given cells cannot be edited through the model', () => {
  const puzzle = SUDOKU_PUZZLES[0]
  const state = createSudokuState(puzzle.id)
  const givenCell = puzzle.givens.findIndex((value) => value !== 0)
  assert.equal(enterValue(state, givenCell, 1), state)
})
