import assert from 'node:assert/strict'
import test from 'node:test'
import { describeSolitaireCard } from './cardAccessibility.ts'

test('Solitaire card names never reveal a face-down card', () => {
  assert.equal(describeSolitaireCard({ id: 'hidden', rank: 'K', suit: 'hearts', faceUp: false }), 'face-down card')
  assert.equal(describeSolitaireCard({ id: 'shown', rank: 'Q', suit: 'hearts', faceUp: true }), 'Queen of Hearts')
  assert.equal(describeSolitaireCard(), 'empty')
})
