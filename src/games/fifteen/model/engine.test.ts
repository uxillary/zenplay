import assert from 'node:assert/strict'
import test from 'node:test'
import { canMoveFifteenTile, createShuffledFifteenState, createSolvedFifteenState, getFifteenManhattanDistance, isFifteenSolved, isFifteenSolvable, moveFifteenTile } from './engine.ts'
import { isFifteenState, restoreFifteenState, serializeFifteenState } from './persistence.ts'

test('recognises the canonical solved arrangement', () => {
  const solved = createSolvedFifteenState()
  assert.equal(isFifteenSolved(solved), true)
  assert.equal(isFifteenSolved({ tiles: [...Array.from({ length: 14 }, (_, index) => index + 1), null, 15] }), false)
})

test('moves one adjacent tile, counts moves and rejects non-adjacent tiles', () => {
  const state = createSolvedFifteenState()
  assert.equal(canMoveFifteenTile(state, 14), true)
  assert.equal(canMoveFifteenTile(state, 11), true)
  assert.equal(canMoveFifteenTile(state, 0), false)
  assert.equal(moveFifteenTile(state, 0), state)
  const moved = moveFifteenTile(state, 14)
  assert.equal(moved.moves, 1)
  assert.deepEqual(moved.tiles.slice(14), [null, 15])
  assert.equal(isFifteenSolved(moved), false)
})

test('generated boards have all tiles, remain solvable and are not solved', () => {
  for (const random of [() => 0, () => 0.5, () => 0.999999]) {
    const state = createShuffledFifteenState(random, 80)
    assert.deepEqual([...state.tiles].sort((a, b) => (a ?? 0) - (b ?? 0)), [null, ...Array.from({ length: 15 }, (_, index) => index + 1)])
    assert.equal(isFifteenSolvable(state.tiles), true)
    assert.equal(isFifteenSolved(state), false)
    assert.ok(getFifteenManhattanDistance(state.tiles) >= 3)
    assert.equal(state.moves, 0)
  }
})

test('serialises and restores valid boards and rejects malformed or unsolvable boards', () => {
  const state = moveFifteenTile(createSolvedFifteenState(), 14)
  assert.equal(isFifteenState(serializeFifteenState(state)), true)
  assert.deepEqual(restoreFifteenState(state), state)
  assert.equal(restoreFifteenState({ ...state, tiles: [...state.tiles.slice(0, 14), 14, 15] }), null)
  const unsolvable = { ...state, tiles: [...state.tiles] }
  ;[unsolvable.tiles[0], unsolvable.tiles[1]] = [unsolvable.tiles[1], unsolvable.tiles[0]]
  assert.equal(isFifteenSolvable(unsolvable.tiles), false)
  assert.equal(restoreFifteenState(unsolvable), null)
  assert.equal(restoreFifteenState({ ...state, moves: -1 }), null)
})
