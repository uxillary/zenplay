import assert from 'node:assert/strict'
import test from 'node:test'
import { applyMove, undo } from '../model/engine.ts'
import { serializeSolitaireState } from '../model/persistence.ts'
import type { Card, SolitaireState } from '../model/types.ts'
import { canStartDragPointer, crossedDragThreshold, legalDropMove, shouldSuppressDraggedClick } from './dragGesture.ts'

const card = (id: string, rank: Card['rank'], suit: Card['suit']): Card => ({ id, rank, suit, faceUp: true })
const game = (): SolitaireState => ({
  tableau: [
    [card('black-8', '8', 'spades'), card('red-7', '7', 'hearts')],
    [card('red-9', '9', 'diamonds')], [], [], [], [], [],
  ],
  foundations: [[], [], [], []], stock: [], waste: [], history: [],
})
const from = { type: 'tableau' as const, index: 0 }
const to = { type: 'tableau' as const, index: 1 }

test('touch and primary mouse can begin a drag, but secondary mouse cannot', () => {
  assert.equal(canStartDragPointer('touch', 0), true)
  assert.equal(canStartDragPointer('mouse', 0), true)
  assert.equal(canStartDragPointer('mouse', 2), false)
})

test('short movement remains a tap until the drag threshold', () => {
  assert.equal(crossedDragThreshold(10, 10, 14, 14), false)
  assert.equal(crossedDragThreshold(10, 10, 17, 10), true)
})

test('the synthetic click after a drag is ignored while keyboard click still works', () => {
  assert.equal(shouldSuppressDraggedClick(1, true), true)
  assert.equal(shouldSuppressDraggedClick(0, true), false)
  assert.equal(shouldSuppressDraggedClick(1, false), false)
})

test('valid multi-card drop uses one move, survives serialization, and can be undone', () => {
  const initial = game()
  const move = legalDropMove(initial, from, 'black-8', to)
  assert.ok(move)
  const moved = applyMove(initial, move)
  assert.deepEqual(moved.tableau[1].map((item) => item.id), ['red-9', 'black-8', 'red-7'])
  assert.equal(moved.history.length, 1)
  assert.deepEqual(serializeSolitaireState(moved).tableau[1], moved.tableau[1])
  assert.deepEqual(undo(moved).tableau, initial.tableau)
})

test('invalid and cancelled drops do not produce a move', () => {
  const initial = game()
  assert.equal(legalDropMove(initial, from, 'black-8', { type: 'tableau', index: 2 }), null)
  assert.equal(legalDropMove(initial, from, 'black-8', null), null)
  assert.equal(legalDropMove(initial, from, 'missing', to), null)
})

test('unordered face-up sequences cannot be dragged as a valid move', () => {
  const initial = game()
  initial.tableau[0][1] = card('red-6', '6', 'hearts')
  assert.equal(legalDropMove(initial, from, 'black-8', to), null)
})
