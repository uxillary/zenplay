import assert from 'node:assert/strict'
import test from 'node:test'
import { trackGameWrites, waitForGameWrites } from './pendingWrites.ts'

test('queues remain isolated by game and failed writes cannot block future readers', async () => {
  let release!: () => void
  trackGameWrites('sudoku', new Promise<void>(resolve => { release = resolve }))
  let finished = false
  const waiting = waitForGameWrites('sudoku').then(() => { finished = true })
  await waitForGameWrites('pairs')
  assert.equal(finished, false)
  release()
  await waiting
  assert.equal(finished, true)
  trackGameWrites('sudoku', Promise.reject(new Error('Fixture storage error')))
  await waitForGameWrites('sudoku')
})
