import assert from 'node:assert/strict'
import test from 'node:test'
import { createPairsState, revealPairCard } from './engine.ts'
import { isPairsState, restorePairsState, serializePairsState } from './persistence.ts'
import type { PairsBoardSize } from './types.ts'

const random = (): (() => number) => {
  let value = 0
  return () => ((value++ * 0.41421356237) % 1)
}

test('serializes and restores board size, shuffled order, matches, current turn, and first selection', () => {
  const state = createPairsState('standard', random())
  const first = state.cards[0]
  const pair = state.cards.find((card) => card.pairId === first.pairId && card.id !== first.id)!
  const afterMatch = revealPairCard(revealPairCard(state, first.id).state, pair.id).state
  const current = revealPairCard(afterMatch, state.cards.find((card) => !afterMatch.matchedPairIds.includes(card.pairId))!.id).state
  const restored = restorePairsState(JSON.parse(JSON.stringify(serializePairsState(current))))
  assert.deepEqual(restored, current)
})

test('normalizes an in-progress mismatch before persistence', () => {
  const state = createPairsState('easy', random())
  const first = state.cards[0]
  const different = state.cards.find((card) => card.pairId !== first.pairId)!
  const mismatch = revealPairCard(revealPairCard(state, first.id).state, different.id).state
  const restored = restorePairsState(serializePairsState(mismatch))
  assert.deepEqual(restored?.revealedCardIds, [])
  assert.equal(restored?.turns, 1)
})

test('rejects malformed, incomplete, duplicate, or unsupported saved states', () => {
  const state = createPairsState('easy', random())
  assert.equal(isPairsState(state), true)
  assert.equal(restorePairsState({ ...state, boardSize: 'huge' as PairsBoardSize }), null)
  assert.equal(restorePairsState({ ...state, cards: state.cards.slice(1) }), null)
  assert.equal(restorePairsState({ ...state, matchedPairIds: [state.cards[0].pairId] }), null)
  const duplicate = structuredClone(state)
  duplicate.cards[1] = { ...duplicate.cards[0] }
  assert.equal(restorePairsState(duplicate), null)
  const invalidMatch = { ...state, matchedPairIds: [state.cards[0].pairId], revealedCardIds: [state.cards[0].id] }
  assert.equal(restorePairsState(invalidMatch), null)
  assert.equal(restorePairsState({ ...state, revealedCardIds: [state.cards[0].id, state.cards[1].id] }), null)
})
