import assert from 'node:assert/strict'
import test from 'node:test'
import { loadSolitaireSave, trackSolitaireWrites } from './save.ts'

test('Solitaire restoration waits for snapshots queued by the previous screen', async () => {
  let finish!: () => void
  trackSolitaireWrites(new Promise<void>((resolve) => { finish = resolve }))
  let restored = false
  const restoration = loadSolitaireSave().then(() => { restored = true })
  await Promise.resolve()
  assert.equal(restored, false)
  finish()
  await restoration
  assert.equal(restored, true)
})

test('a failed write cannot permanently block restoration or local-only play', async () => {
  trackSolitaireWrites(Promise.reject(new Error('Fixture storage failure')))
  assert.deepEqual(await loadSolitaireSave(), { status: 'none' })
})
