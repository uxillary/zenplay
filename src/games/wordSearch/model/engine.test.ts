import test from 'node:test'
import assert from 'node:assert/strict'
import { createWordSearchState, getWordPath, getWordSearchHint, isWordSearchComplete, selectWord } from './engine.ts'
import { createBundledWordSearchPuzzle, WORD_SEARCH_PUZZLES, validateWordSearchPuzzle } from './puzzles.ts'

const puzzle = WORD_SEARCH_PUZZLES[0]
const play = (index: number, reverse = false) => {
  const item = puzzle.words[index]
  const first = item.cells[reverse ? item.cells.length - 1 : 0]
  const last = item.cells[reverse ? 0 : item.cells.length - 1]
  return selectWord(puzzle, createWordSearchState(puzzle.id), first, last)
}

test('all bundled puzzles are valid, deterministic, and spell their targets at stored cells', () => {
  assert.equal(WORD_SEARCH_PUZZLES.length, 12)
  assert.ok(WORD_SEARCH_PUZZLES.every(validateWordSearchPuzzle))
  for (const item of WORD_SEARCH_PUZZLES) for (const target of item.words) {
    assert.equal(target.cells.map(({ row, column }) => item.grid[row][column]).join(''), target.word)
  }
  for (let themeIndex = 0; themeIndex < 6; themeIndex++) {
    assert.deepEqual(createBundledWordSearchPuzzle(themeIndex, 1), createBundledWordSearchPuzzle(themeIndex, 1))
    assert.deepEqual(createBundledWordSearchPuzzle(themeIndex, 2), createBundledWordSearchPuzzle(themeIndex, 2))
  }
})

test('selection path accepts horizontal, vertical, diagonal, and reverse directions', () => {
  assert.deepEqual(getWordPath({ row: 2, column: 1 }, { row: 2, column: 4 })?.length, 4)
  assert.deepEqual(getWordPath({ row: 1, column: 3 }, { row: 4, column: 3 })?.length, 4)
  assert.deepEqual(getWordPath({ row: 1, column: 1 }, { row: 4, column: 4 })?.length, 4)
  assert.deepEqual(play(0).result, 'found')
  assert.deepEqual(play(0, true).result, 'found')
})

test('the same selection rule finds words placed horizontally, vertically, diagonally, and backwards', () => {
  const cases = [
    { cells: [{ row: 0, column: 0 }, { row: 0, column: 1 }, { row: 0, column: 2 }], reverse: false },
    { cells: [{ row: 0, column: 0 }, { row: 1, column: 0 }, { row: 2, column: 0 }], reverse: false },
    { cells: [{ row: 0, column: 0 }, { row: 1, column: 1 }, { row: 2, column: 2 }], reverse: false },
    { cells: [{ row: 0, column: 0 }, { row: 0, column: 1 }, { row: 0, column: 2 }], reverse: true },
  ]
  for (const { cells, reverse } of cases) {
    const grid = Array.from({ length: 3 }, () => Array(3).fill('X'))
    cells.forEach(({ row, column }, index) => { grid[row][column] = 'CAT'[index] })
    const testPuzzle = { id: 'test', theme: 'Test', grid, words: [{ word: 'CAT', cells }] }
    const start = cells[reverse ? 2 : 0]
    const end = cells[reverse ? 0 : 2]
    assert.equal(selectWord(testPuzzle, createWordSearchState('test'), start, end).result, 'complete')
  }
})

test('invalid/duplicate selections, hints, found state, and completion behave safely', () => {
  const first = puzzle.words[0]
  const state = createWordSearchState(puzzle.id)
  assert.equal(selectWord(puzzle, state, first.cells[0], { row: 0, column: 0 }).result, 'invalid')
  assert.deepEqual(getWordSearchHint(puzzle, state), first.cells[0])
  const found = selectWord(puzzle, state, first.cells[0], first.cells.at(-1)!)
  assert.equal(found.result, 'found')
  assert.equal(found.state.foundWords[0], first.word)
  assert.equal(selectWord(puzzle, found.state, first.cells[0], first.cells.at(-1)!).result, 'already-found')
  let completeState = createWordSearchState(puzzle.id)
  for (const word of puzzle.words) completeState = selectWord(puzzle, completeState, word.cells[0], word.cells.at(-1)!).state
  assert.equal(isWordSearchComplete(puzzle, completeState), true)
  assert.equal(selectWord(puzzle, completeState, puzzle.words.at(-1)!.cells[0], puzzle.words.at(-1)!.cells.at(-1)!).result, 'already-found')
})

