import test from 'node:test'
import assert from 'node:assert/strict'
import { applyMahjongHint, CLASSIC_TURTLE_LAYOUT, canMahjongTilesMatch, createMahjongState, getAvailableMahjongPairs, getMahjongRaisedElevations, hasMahjongMoves, isMahjongComplete, isMahjongTileFree, LEGACY_CLASSIC_TURTLE_LAYOUT, removeMahjongPair, undoMahjong } from './engine.ts'
import { restoreMahjongState, serializeMahjongState } from './persistence.ts'
import type { MahjongState, MahjongTile } from './types.ts'

const tile = (id: string, x: number, y = 0, z = 0, matchKey = 'bamboo-3', removed = false): MahjongTile => ({ id, family: 'bamboo', value: 3, matchKey, x, y, z, removed })
const stateWithTiles = (tiles: MahjongTile[], freeHints = 0, rewardedLayers: number[] = []): MahjongState => ({ tiles, removedPairs: [], moves: 0, accessibleLabels: false, freeHints, rewardedLayers })

const raisedPairState = () => stateWithTiles([
  tile('base-under', 0), tile('cap-a', 0, 0, 1), tile('cap-b', 2, 0, 1),
  tile('base-a', 5), tile('base-b', 7),
])

test('Classic Turtle has 144 spatially distinct tile positions across four elevations', () => {
  assert.equal(CLASSIC_TURTLE_LAYOUT.length, 144)
  assert.equal(new Set(CLASSIC_TURTLE_LAYOUT.map(({ x, y, z }) => `${x}:${y}:${z}`)).size, 144)
  assert.deepEqual(new Set(CLASSIC_TURTLE_LAYOUT.map(({ z }) => z)), new Set([0, 1, 2, 3]))
})

test('the three raised board elevations are the eligible progression layers', () => {
  assert.deepEqual(getMahjongRaisedElevations(CLASSIC_TURTLE_LAYOUT), [1, 2, 3])
})

test('tiles covered from above or blocked on both sides are not free', () => {
  const covered = tile('a', 0)
  assert.equal(isMahjongTileFree(covered, [covered, tile('cover', 0, 0, 1)]), false)
  const middle = tile('middle', 1)
  assert.equal(isMahjongTileFree(middle, [tile('left', 0), middle, tile('right', 2)]), false)
})

test('upper tiles can be free and removing a covering pair exposes the lower tile', () => {
  const base = tile('base', 0)
  const capA = tile('cap-a', 0, 0, 1)
  const capB = tile('cap-b', 2, 0, 1)
  assert.equal(isMahjongTileFree(capA, [base, capA, capB]), true)
  assert.equal(isMahjongTileFree(base, [base, capA, capB]), false)
  const removed = removeMahjongPair({ tiles: [base, capA, capB], removedPairs: [], moves: 0, accessibleLabels: false, freeHints: 0, rewardedLayers: [] }, capA.id, capB.id)
  assert.equal(isMahjongTileFree(removed.tiles[0], removed.tiles), true)
  const restored = undoMahjong(removed)
  assert.equal(isMahjongTileFree(restored.tiles[0], restored.tiles), false)
})

test('a tile is free when either horizontal side is open', () => {
  const middle = tile('middle', 1)
  assert.equal(isMahjongTileFree(middle, [tile('left', 0), middle]), true)
  assert.equal(isMahjongTileFree(middle, [middle, tile('right', 2)]), true)
})

test('removing a same-level side neighbour frees the adjacent tile', () => {
  const left = tile('left', 0)
  const middle = tile('middle', 1)
  const right = tile('right', 2)
  const mate = tile('mate', 4)
  const state: MahjongState = { tiles: [left, middle, right, mate], removedPairs: [], moves: 0, accessibleLabels: false, freeHints: 0, rewardedLayers: [] }
  assert.equal(isMahjongTileFree(middle, state.tiles), false)
  const next = removeMahjongPair(state, right.id, mate.id)
  assert.equal(isMahjongTileFree(next.tiles.find(({ id }) => id === middle.id)!, next.tiles), true)
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
  const state: MahjongState = { tiles: [tile('a', 0), tile('b', 1), tile('cap', 0, 0, 1, 'dots-4')], removedPairs: [], moves: 0, accessibleLabels: false, freeHints: 0, rewardedLayers: [] }
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

test('new boards have four of each identity, multiple elevations, and a legal pair', () => {
  const state = createMahjongState(() => 0.37)
  const counts = new Map<string, number>()
  state.tiles.forEach(({ matchKey }) => counts.set(matchKey, (counts.get(matchKey) ?? 0) + 1))
  assert.equal(state.tiles.length, 144)
  assert.deepEqual(new Set(state.tiles.map(({ z }) => z)), new Set([0, 1, 2, 3]))
  assert.equal(counts.size, 36)
  assert.ok([...counts.values()].every((count) => count === 4))
  assert.ok(getAvailableMahjongPairs(state).length > 0)
  assert.equal(hasMahjongMoves(state), true)
})

test('available pairs, no-moves, and win detection reflect current tile states', () => {
  const pair = tile('a', 0)
  const state: MahjongState = { tiles: [pair, tile('b', 1)], removedPairs: [], moves: 0, accessibleLabels: false, freeHints: 0, rewardedLayers: [] }
  assert.deepEqual(getAvailableMahjongPairs(state), [['a', 'b']])
  const done = removeMahjongPair(state, 'a', 'b')
  assert.equal(hasMahjongMoves(done), false)
  assert.equal(isMahjongComplete(done), true)
  assert.equal(isMahjongComplete(state), false)
  const stuck: MahjongState = { ...state, tiles: [tile('c', 0, 0, 0, 'bamboo-3'), tile('d', 1, 0, 0, 'dots-3')] }
  assert.equal(hasMahjongMoves(stuck), false)
  assert.equal(isMahjongComplete(stuck), false)
})

test('clearing a raised elevation grants and records one free Hint', () => {
  const state = raisedPairState()
  const cleared = removeMahjongPair(state, 'cap-a', 'cap-b')
  assert.equal(cleared.freeHints, 1)
  assert.deepEqual(cleared.rewardedLayers, [1])
  assert.equal(cleared.tiles.filter((item) => item.z === 1 && !item.removed).length, 0)
})

test('clearing the base elevation does not grant a Hint', () => {
  const state = stateWithTiles([tile('base-a', 0), tile('base-b', 2), tile('raised', 5, 0, 1, 'dots-4')])
  const cleared = removeMahjongPair(state, 'base-a', 'base-b')
  assert.equal(cleared.freeHints, 0)
  assert.deepEqual(cleared.rewardedLayers, [])
})

test('Undo preserves an unspent layer reward and the layer cannot reward twice', () => {
  const cleared = removeMahjongPair(raisedPairState(), 'cap-a', 'cap-b')
  const undone = undoMahjong(cleared)
  assert.equal(undone.freeHints, 1)
  assert.deepEqual(undone.rewardedLayers, [1])
  const clearedAgain = removeMahjongPair(undone, 'cap-a', 'cap-b')
  assert.equal(clearedAgain.freeHints, 1)
  assert.deepEqual(clearedAgain.rewardedLayers, [1])
})

test('spending a layer reward then Undoing and re-clearing neither refunds nor regenerates it', () => {
  const cleared = removeMahjongPair(raisedPairState(), 'cap-a', 'cap-b')
  const availablePair = getAvailableMahjongPairs(cleared)[0]
  const spent = applyMahjongHint(cleared)
  assert.deepEqual(spent.pair, availablePair)
  assert.equal(spent.state.freeHints, 0)
  const undone = undoMahjong(spent.state)
  assert.equal(undone.freeHints, 0)
  assert.deepEqual(undone.rewardedLayers, [1])
  const clearedAgain = removeMahjongPair(undone, 'cap-a', 'cap-b')
  assert.equal(clearedAgain.freeHints, 0)
  assert.deepEqual(clearedAgain.rewardedLayers, [1])
})

test('each different raised elevation awards once, but never more than once', () => {
  let state = stateWithTiles([
    tile('base', 10), tile('middle-a', 0, 0, 1), tile('middle-b', 2, 0, 1),
    tile('top-a', 5, 0, 2), tile('top-b', 7, 0, 2),
  ])
  state = removeMahjongPair(state, 'top-a', 'top-b')
  assert.equal(state.freeHints, 1)
  state = removeMahjongPair(state, 'middle-a', 'middle-b')
  assert.equal(state.freeHints, 2)
  assert.deepEqual(state.rewardedLayers.slice().sort((a, b) => a - b), [1, 2])
})

test('one successful pair can reward multiple newly cleared elevations', () => {
  const state = stateWithTiles([
    tile('base', 6), tile('middle', 0, 0, 1, 'bamboo-3'), tile('top', 3, 0, 2, 'bamboo-3'),
  ])
  const cleared = removeMahjongPair(state, 'middle', 'top')
  assert.equal(cleared.freeHints, 2)
  assert.deepEqual(cleared.rewardedLayers, [1, 2])
})

test('Hint spends one earned Hint only when it can identify a valid pair', () => {
  const available = stateWithTiles([tile('a', 0), tile('b', 2), tile('other', 5, 0, 0, 'dots-4')], 2, [1, 2])
  const used = applyMahjongHint(available)
  assert.deepEqual(used.pair, ['a', 'b'])
  assert.equal(used.state.freeHints, 1)
  const unavailable = stateWithTiles([tile('a', 0), tile('b', 2, 0, 0, 'dots-4')], 1, [1])
  const noHint = applyMahjongHint(unavailable)
  assert.equal(noHint.pair, null)
  assert.equal(noHint.state, unavailable)
})

test('a new game starts with no earned Hints or rewarded elevations', () => {
  const next = createMahjongState(() => 0.41)
  assert.equal(next.freeHints, 0)
  assert.deepEqual(next.rewardedLayers, [])
})

test('valid saved state round-trips and malformed/incompatible state is rejected', () => {
  const state = createMahjongState(() => 0.23)
  assert.deepEqual(restoreMahjongState(serializeMahjongState(state)), state)
  const [first, second] = getAvailableMahjongPairs(state)[0]
  const inProgress = removeMahjongPair(state, first, second)
  const rewardedState = { ...inProgress, freeHints: 2, rewardedLayers: [1, 2] }
  assert.deepEqual(restoreMahjongState(serializeMahjongState(rewardedState)), rewardedState)
  const resumed = restoreMahjongState(serializeMahjongState(inProgress))
  assert.deepEqual(resumed, inProgress)
  assert.deepEqual(undoMahjong(resumed!), state)
  assert.equal(restoreMahjongState({ ...state, tiles: state.tiles.slice(1) }), null)
  assert.equal(restoreMahjongState({ ...state, tiles: state.tiles.map((item, i) => i === 0 ? { ...item, x: Number.NaN } : item) }), null)
  assert.equal(restoreMahjongState({ ...state, tiles: state.tiles.map((item, i) => i === 0 ? { ...item, x: 999 } : item) }), null)
  assert.equal(restoreMahjongState({ ...state, freeHints: 1 }), null)
})

test('legacy M13A saves migrate to the current layered footprint and preserve tile state', () => {
  const initial = createMahjongState(() => 0.23)
  const [first, second] = getAvailableMahjongPairs(initial)[0]
  const state = removeMahjongPair(initial, first, second)
  const oldByLayer = new Map<number, typeof LEGACY_CLASSIC_TURTLE_LAYOUT[number][]>()
  const newByLayer = new Map<number, typeof CLASSIC_TURTLE_LAYOUT[number][]>()
  for (const z of [0, 1, 2, 3]) {
    oldByLayer.set(z, LEGACY_CLASSIC_TURTLE_LAYOUT.filter((slot) => slot.z === z).slice().sort((a, b) => a.y - b.y || a.x - b.x))
    newByLayer.set(z, CLASSIC_TURTLE_LAYOUT.filter((slot) => slot.z === z).slice().sort((a, b) => a.y - b.y || a.x - b.x))
  }
  const oldTiles = state.tiles.map((item) => {
    const index = newByLayer.get(item.z)!.findIndex((slot) => slot.x === item.x && slot.y === item.y)
    return { ...item, ...oldByLayer.get(item.z)![index] }
  })
  const oldState: MahjongState = { ...state, tiles: oldTiles, freeHints: 2, rewardedLayers: [1, 2] }
  const restored = restoreMahjongState(serializeMahjongState(oldState))
  assert.ok(restored)
  assert.deepEqual(restored.tiles.map(({ id, family, value, x, y, z, removed, matchKey }) => ({ id, family, value, x, y, z, removed, matchKey })), state.tiles.map(({ id, family, value, x, y, z, removed, matchKey }) => ({ id, family, value, x, y, z, removed, matchKey })))
  assert.equal(restored.freeHints, 2)
  assert.deepEqual(restored.rewardedLayers, [1, 2])
  assert.deepEqual(restored.removedPairs, state.removedPairs)
  assert.deepEqual(undoMahjong(restored).tiles.map(({ id, removed }) => [id, removed]), initial.tiles.map(({ id, removed }) => [id, removed]))
})

test('old saves default M13C progression without inferring rewards from empty layers', () => {
  const state = createMahjongState(() => 0.23)
  const faces = new Map(state.tiles.map((item) => [item.matchKey, item]))
  const keys = [...faces.keys()]
  const raisedKeys = keys.slice(0, 21).flatMap((key) => [key, key])
  const baseKeys = [...keys.slice(0, 21).flatMap((key) => [key, key]), ...keys.slice(21).flatMap((key) => [key, key, key, key])]
  let raisedIndex = 0
  let baseIndex = 0
  const oldTiles = state.tiles.map((slot) => {
    const key = slot.z > 0 ? raisedKeys[raisedIndex++] : baseKeys[baseIndex++]
    const face = faces.get(key)!
    return { ...slot, family: face.family, value: face.value, matchKey: key, removed: slot.z > 0 }
  })
  const removedIds = oldTiles.filter((item) => item.removed).map((item) => item.id)
  const oldSave = {
    ...state,
    tiles: oldTiles,
    removedPairs: Array.from({ length: removedIds.length / 2 }, (_, index) => [removedIds[index * 2], removedIds[index * 2 + 1]] as [string, string]),
    moves: removedIds.length / 2,
  }
  const legacy = Object.fromEntries(Object.entries(oldSave).filter(([key]) => key !== 'freeHints' && key !== 'rewardedLayers'))
  const restored = restoreMahjongState(legacy)
  assert.equal(restored?.freeHints, 0)
  assert.deepEqual(restored?.rewardedLayers, [])
})
