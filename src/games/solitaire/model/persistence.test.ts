import assert from 'node:assert/strict'
import test from 'node:test'
import { dealFromStock, undo } from './engine.ts'
import { createInitialState } from './deal.ts'
import { isResumableSolitaireState, isSolitaireState, restoreSolitaireState, serializeSolitaireState } from './persistence.ts'
import { RANKS, SUITS, type Card, type SolitaireState } from './types.ts'
import { isSolitaireSaveState } from '../save.ts'

test('serializes and restores Solitaire state with undo history', () => {
  const initial = createInitialState()
  const drawn = dealFromStock(initial, 3)
  const serialized = JSON.parse(JSON.stringify(serializeSolitaireState(drawn))) as unknown
  const restored = restoreSolitaireState(serialized)
  assert.ok(restored)
  assert.deepEqual(restored, drawn)
  assert.deepEqual(undo(restored), initial)
})

test('rejects malformed Solitaire saves and duplicate or missing cards', () => {
  const state = createInitialState()
  assert.equal(isSolitaireState(state), true)
  const malformed = structuredClone(state) as SolitaireState
  malformed.stock.pop()
  assert.equal(restoreSolitaireState(malformed), null)
  assert.equal(restoreSolitaireState({ ...state, tableau: [] }), null)
})

test('does not offer an accurately completed board as an unfinished save', () => {
  const foundations = SUITS.map((suit) => RANKS.map((rank) => ({
    id: `${suit}-${rank}`,
    suit,
    rank,
    faceUp: true,
  } satisfies Card)))
  const completed: SolitaireState = {
    tableau: [[], [], [], [], [], [], []],
    foundations,
    stock: [],
    waste: [],
    history: [],
  }
  assert.equal(isSolitaireState(completed), true)
  assert.equal(isResumableSolitaireState(completed), false)
})

test('a persisted Solitaire save includes and validates its stock draw mode', () => {
  const gameState = createInitialState()
  assert.equal(isSolitaireSaveState({ gameState, drawMode: 'three' }), true)
  assert.equal(isSolitaireSaveState({ gameState, drawMode: 'weekly' }), false)
  assert.equal(isSolitaireSaveState({ gameState }), false)
})
