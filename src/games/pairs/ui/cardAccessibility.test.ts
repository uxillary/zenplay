import assert from 'node:assert/strict'
import test from 'node:test'
import { describePairsCard } from './cardAccessibility.ts'

const card = { id: 'card-1', pairId: 'sun' as const }

test('hidden Pairs labels never expose the card face', () => {
  assert.equal(describePairsCard(0, card, false, false, false), 'Card 1, hidden.')
  assert.equal(describePairsCard(0, card, true, false, false), 'Card 1, sun.')
  assert.equal(describePairsCard(0, card, true, true, false), 'Card 1, sun, matched.')
})
