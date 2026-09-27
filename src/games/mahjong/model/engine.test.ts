import test from 'node:test'
import assert from 'node:assert/strict'
import { CLASSIC_TURTLE_LAYOUT, canMahjongTilesMatch, createMahjongState, getAvailableMahjongPairs, hasMahjongMoves, isMahjongComplete, isMahjongTileFree, removeMahjongPair, undoMahjong } from './engine.ts'
import { restoreMahjongState, serializeMahjongState } from './persistence.ts'
import type { MahjongState, MahjongTile } from './types.ts'

const tile = (id: string, x: number, y = 0, z = 0, matchKey = 'bamboo-3', removed = false): MahjongTile => ({ id, family: 'bamboo', value: 3, matchKey, x, y, z, removed })

test('Classic Turtle has 144 spatially distinct tile positions across four layers', () => {
  assert.equal(CLASSIC_TURTLE_LAYOUT.length, 144)
  assert.equal(new Set(CLASSIC_TURTLE_LAYOUT.map(({ x, y, z }) => `${x}:${y}:${z}`)).size, 144)
  assert.deepEqual(new Set(CLASSIC_TURTLE_LAYOUT.map(({ z }) => z)), new Set([0, 1, 2, 3]))
})

test('tiles covered from above or blocked on both sides are not free', () => {
  const covered = tile('a', 0)
  assert.equal(isMahjongTileFree(covered, [covered, tile('cover', 0, 0, 1)]), false)
  const middle = tile('middle', 1)
  assert.equal(isMahjongTileFree(middle, [tile('left', 0), middle, tile('right', 2)]), false)
})

test('a tile is free when either horizontal side is open', () => {
  const middle = tile('middle', 1)
  assert.equal(isMahjongTileFree(middle, [tile('left', 0), middle]), true)
  assert.equal(isMahjongTileFree(middle, [middle, tile('right', 2)]), true)
})

test('overlap uses tile footprints and ignores removed blockers', () => {
  const base = tile('base', 1, 1)
  assert.equal(isMahjongTileFree(base, [base, tile('overlap', 1.5, 1.5, 1)]), false)
  assert.equal(isMahjongTileFree(base, [base, { ...tile('gone', 1, 1, 1), removed: true }]), true)
})

test('standard identities match only when identical and special families match by family', () => {
  assert.equal(canMahjongTilesMatch(tile('a', 0), tile('b', 1)), true)
  assert.equal(canMahjongTilesMatch(tile('a', 0), tile('b', 1, 0, 0, 'bamboo-4')), false)
  assert.equal(canMahjongTilesMatch({ ...tile('f1', 0), family: 'flowers', value: 'plum', matchKey: 'flowers' }, { ...tile('f2', 1), family: 'flowers', value: 'orchid', matchKey: 'flowers' }), true)
  assert.equal(canMahjongTilesMatch({ ...tile('f1', 0), family: 'flowers', matchKey: 'flowers' }, { ...tile('s1', 1), family: 'seasons', matchKey: 'seasons' }), false)
})

test('blocked matching tiles cannot be removed; free matches can and undo restores exact positions', () => {
  const state: MahjongState = { tiles: [tile('a', 0), tile('b', 1), tile('cap', 0, 0, 1, 'dots-4')], removedPairs: [], moves: 0, accessibleLabels: false }
  assert.equal(removeMahjongPair(state, 'a', 'b'), state)
  const open = { ...state, tiles: state.tiles.filter((item) => item.id !== 'cap') }
  const removed = removeMahjongPair(open, 'a', 'b')
  assert.equal(removed.moves, 1)
  assert.deepEqual(removed.tiles.filter((item) => item.removed).map((item) => item.id), ['a', 'b'])
  const restored = undoMahjong(removed)
  assert.equal(restored.moves, 0)
  assert.deepEqual(restored.tiles, open.tiles)
  assert.deepEqual(undoMahjong(restored), restored)
})

test('new boards have four of each identity and at least one available pair', () => {
  const state = createMahjongState(() => 0.37)
  const counts = new Map<string, number>()
  state.tiles.forEach(({ matchKey }) => counts.set(matchKey, (counts.get(matchKey) ?? 0) + 1))
  assert.equal(state.tiles.length, 144)
  assert.equal(counts.size, 36)
  assert.ok([...counts.values()].every((count) => count === 4))
  assert.ok(getAvailableMahjongPairs(state).length > 0)
  assert.equal(hasMahjongMoves(state), true)
})

test('available pairs, no-moves, and win detection reflect current tile states', () => {
  const pair = tile('a', 0)
  const state: MahjongState = { tiles: [pair, tile('b', 1)], removedPairs: [], moves: 0, accessibleLabels: false }
  assert.deepEqual(getAvailableMahjongPairs(state), [['a', 'b']])
  const done = removeMahjongPair(state, 'a', 'b')
  assert.equal(hasMahjongMoves(done), false)
  assert.equal(isMahjongComplete(done), true)
  assert.equal(isMahjongComplete(state), false)
  const stuck: MahjongState = { ...state, tiles: [tile('c', 0, 0, 0, 'bamboo-3'), tile('d', 1, 0, 0, 'dots-3')] }
  assert.equal(hasMahjongMoves(stuck), false)
  assert.equal(isMahjongComplete(stuck), false)
})

test('valid saved state round-trips and malformed/incompatible state is rejected', () => {
  const state = createMahjongState(() => 0.23)
  assert.deepEqual(restoreMahjongState(serializeMahjongState(state)), state)
  assert.equal(restoreMahjongState({ ...state, tiles: state.tiles.slice(1) }), null)
  assert.equal(restoreMahjongState({ ...state, tiles: state.tiles.map((item, i) => i === 0 ? { ...item, x: Number.NaN } : item) }), null)
  assert.equal(restoreMahjongState({ ...state, tiles: state.tiles.map((item, i) => i === 0 ? { ...item, x: 999 } : item) }), null)
})
