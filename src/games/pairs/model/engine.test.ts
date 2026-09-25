import assert from 'node:assert/strict'
import test from 'node:test'
import { createPairsState, getHintCardId, hideMismatchedCards, isPairsComplete, revealPairCard } from './engine.ts'
import type { PairFaceId, PairsBoardSize } from './types.ts'

const deterministicRandom = (): (() => number) => {
  let value = 0
  return () => ((value++ * 0.61803398875) % 1)
}

const firstPairCards = (size: PairsBoardSize = 'easy') => {
  const state = createPairsState(size, deterministicRandom())
  const pairId = state.cards[0].pairId
  return { state, pairId, cards: state.cards.filter((card) => card.pairId === pairId) }
}

test('creates each board size with exactly two cards for every pair', () => {
  for (const [size, pairCount] of [['easy', 6], ['standard', 8], ['more', 12]] as const) {
    const state = createPairsState(size, deterministicRandom())
    assert.equal(state.cards.length, pairCount * 2)
    assert.equal(new Set(state.cards.map((card) => card.id)).size, pairCount * 2)
    assert.deepEqual([...new Set(state.cards.map((card) => card.pairId))].map((id) => state.cards.filter((card) => card.pairId === id).length), Array(pairCount).fill(2))
  }
  const shuffledState = createPairsState('easy', () => 0)
  assert.notDeepEqual(shuffledState.cards.map((card) => card.pairId), ['sun', 'sun', 'star', 'star', 'heart', 'heart', 'leaf', 'leaf', 'house', 'house', 'key', 'key'])
})

test('reveals one card and ignores selecting the same card twice', () => {
  const { state, cards } = firstPairCards()
  const first = revealPairCard(state, cards[0].id)
  assert.equal(first.result, 'first')
  assert.deepEqual(first.state.revealedCardIds, [cards[0].id])
  assert.equal(revealPairCard(first.state, cards[0].id).result, 'ignored')
  assert.equal(state.revealedCardIds.length, 0)
})

test('matching cards stay matched and count as one turn', () => {
  const { state, pairId, cards } = firstPairCards()
  const first = revealPairCard(state, cards[0].id).state
  const match = revealPairCard(first, cards[1].id)
  assert.equal(match.result, 'match')
  assert.deepEqual(match.state.matchedPairIds, [pairId])
  assert.deepEqual(match.state.revealedCardIds, [])
  assert.equal(match.state.turns, 1)
  assert.equal(revealPairCard(match.state, cards[0].id).result, 'ignored')
})

test('mismatches show both cards until resolved, then return to a stable state', () => {
  const { state } = firstPairCards()
  const first = state.cards[0]
  const different = state.cards.find((card) => card.pairId !== first.pairId)!
  const one = revealPairCard(state, first.id).state
  const mismatch = revealPairCard(one, different.id)
  assert.equal(mismatch.result, 'mismatch')
  assert.deepEqual(mismatch.state.revealedCardIds, [first.id, different.id])
  assert.equal(mismatch.state.turns, 1)
  assert.equal(revealPairCard(mismatch.state, state.cards.find((card) => card.pairId !== first.pairId && card.id !== different.id)!.id).result, 'ignored')
  assert.deepEqual(hideMismatchedCards(mismatch.state).revealedCardIds, [])
})

test('hints select an unmatched card, and with one card showing hint its partner', () => {
  const { state, pairId, cards } = firstPairCards()
  const hint = getHintCardId(state)
  assert.ok(state.cards.some((card) => card.id === hint))
  const one = revealPairCard(state, cards[0].id).state
  const partnerHint = getHintCardId(one)
  assert.equal(one.cards.find((card) => card.id === partnerHint)?.pairId, pairId)
  const matched = revealPairCard(one, cards[1].id).state
  const nextHint = getHintCardId(matched)
  assert.ok(nextHint)
  assert.equal(matched.matchedPairIds.includes(matched.cards.find((card) => card.id === nextHint)!.pairId), false)
})

test('detects completion after every pair is matched', () => {
  const state = createPairsState('easy', deterministicRandom())
  let current = state
  for (const pairId of [...new Set(state.cards.map((card) => card.pairId))] as PairFaceId[]) {
    const pair = state.cards.filter((card) => card.pairId === pairId)
    current = revealPairCard(current, pair[0].id).state
    current = revealPairCard(current, pair[1].id).state
  }
  assert.equal(current.turns, 6)
  assert.equal(isPairsComplete(current), true)
})
