import assert from 'node:assert/strict'
import test from 'node:test'
import { formatFifteenStartedCount } from './statisticsCopy.ts'

test('formats Fifteen Puzzle start counts with singular and plural grammar', () => {
  assert.equal(formatFifteenStartedCount(1), '1 puzzle started')
  assert.equal(formatFifteenStartedCount(2), '2 puzzles started')
  assert.equal(formatFifteenStartedCount(3), '3 puzzles started')
})
