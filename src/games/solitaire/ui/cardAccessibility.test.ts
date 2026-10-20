import assert from 'node:assert/strict'
import test from 'node:test'
import type { SolitaireState } from '../model/types.ts'
import { describeSelectedSolitaireCard, describeSolitaireCard } from './cardAccessibility.ts'

test('Solitaire card names never reveal a face-down card', () => {
  assert.equal(describeSolitaireCard({ id: 'hidden', rank: 'K', suit: 'hearts', faceUp: false }), 'face-down card')
  assert.equal(describeSolitaireCard({ id: 'shown', rank: 'Q', suit: 'hearts', faceUp: true }), 'Queen of Hearts')
  assert.equal(describeSolitaireCard(), 'empty')
})

test('selected-card feedback names waste and tableau cards without exposing a hidden card', () => {
  const state: Pick<SolitaireState, 'waste' | 'tableau'> = {
    waste: [{ id: 'w', rank: 'Q', suit: 'hearts', faceUp: true }],
    tableau: [[{ id: 't', rank: '10', suit: 'clubs', faceUp: true }], [{ id: 'h', rank: 'K', suit: 'spades', faceUp: false }]],
  }
  assert.equal(describeSelectedSolitaireCard(null, state), null)
  assert.equal(describeSelectedSolitaireCard({ location: { type: 'waste' }, cardId: 'w' }, state), 'Queen of Hearts selected. Tap a destination or cancel.')
  assert.equal(describeSelectedSolitaireCard({ location: { type: 'tableau', index: 0 }, cardId: 't' }, state), '10 of Clubs selected. Tap a destination or cancel.')
  assert.equal(describeSelectedSolitaireCard({ location: { type: 'tableau', index: 1 }, cardId: 'h' }, state), 'face-down card selected. Tap a destination or cancel.')
})
