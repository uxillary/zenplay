import assert from 'node:assert/strict'
import test from 'node:test'
import { ACTION_FEEDBACK_MS, INVALID_FEEDBACK_MS, resolveFeedback } from './feedback.ts'

const base = {
  verbose: false,
  invalid: false,
  hasHint: false,
  selectedDescription: '',
  actionMessage: '',
  dragging: false,
}

test('quiet feedback hides routine text visually while preserving screen-reader status', () => {
  assert.deepEqual(resolveFeedback({ ...base, selectedDescription: 'Queen of Hearts selected' }), {
    mode: 'stats', screenReaderOnly: 'Queen of Hearts selected',
  })
  assert.deepEqual(resolveFeedback({ ...base, actionMessage: 'Last move undone' }), {
    mode: 'stats', screenReaderOnly: 'Last move undone',
  })
  assert.deepEqual(resolveFeedback({ ...base, dragging: true, selectedDescription: 'Queen of Hearts selected' }), {
    mode: 'stats', screenReaderOnly: '',
  })
})

test('verbose feedback shows routine text; invalid moves and requested hints take priority', () => {
  assert.equal(resolveFeedback({ ...base, verbose: true, selectedDescription: 'Selected' }).mode, 'selection')
  assert.equal(resolveFeedback({ ...base, verbose: true, actionMessage: 'Moved' }).mode, 'action')
  assert.equal(resolveFeedback({ ...base, invalid: true, selectedDescription: 'Selected' }).mode, 'invalid')
  assert.equal(resolveFeedback({ ...base, hasHint: true, selectedDescription: 'Selected' }).mode, 'hint')
  assert.equal(resolveFeedback({ ...base, invalid: true, hasHint: true }).mode, 'invalid')
})

test('nonessential feedback expires while a requested hint has no automatic timeout', () => {
  assert.ok(INVALID_FEEDBACK_MS >= 2000 && INVALID_FEEDBACK_MS <= 4000)
  assert.ok(ACTION_FEEDBACK_MS >= 2000 && ACTION_FEEDBACK_MS <= 4000)
})
