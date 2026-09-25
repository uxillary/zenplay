import assert from 'node:assert/strict'
import test from 'node:test'
import type { PersistenceDatabase } from './database.ts'
import { deleteActiveSave, hasActiveSave, loadActiveSave, saveActiveGame } from './gameSave.ts'
import { recordGameCompleted, recordGameStarted, readStatistics } from './statistics.ts'
import { GAME_SAVE_SCHEMA_VERSION } from './types.ts'

class MemoryDatabase implements PersistenceDatabase {
  saves = new Map<string, unknown>()
  statistics = new Map<string, unknown>()
  async getSave(gameId: string) { return this.saves.get(gameId) }
  async putSave(save: unknown) { this.saves.set((save as { gameId: string }).gameId, structuredClone(save)) }
  async deleteSave(gameId: string) { this.saves.delete(gameId) }
  async getStatistics(gameId: string) { return structuredClone(this.statistics.get(gameId)) }
  async putStatistics(stats: Parameters<PersistenceDatabase['putStatistics']>[0]) { this.statistics.set(stats.gameId, structuredClone(stats)) }
  async updateStatistics(gameId: string, update: Parameters<PersistenceDatabase['updateStatistics']>[1]) {
    const next = update(this.statistics.get(gameId))
    this.statistics.set(gameId, structuredClone(next))
    return next
  }
}

const validate = (value: unknown): value is { cards: string[] } =>
  typeof value === 'object' && value !== null && Array.isArray((value as { cards?: unknown }).cards)

test('serializes and restores a versioned active save', async () => {
  const database = new MemoryDatabase()
  const state = { cards: ['clubs-A'] }
  assert.equal(await saveActiveGame('solitaire', state, { sessionId: 'session-1', createdAt: '2026-01-01T00:00:00.000Z' }, database, '2026-01-01T00:01:00.000Z'), true)
  assert.deepEqual(database.saves.get('solitaire'), {
    schemaVersion: GAME_SAVE_SCHEMA_VERSION,
    gameId: 'solitaire',
    sessionId: 'session-1',
    state,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:01:00.000Z',
  })
  assert.deepEqual(await loadActiveSave('solitaire', validate, database), database.saves.get('solitaire'))
  assert.equal(await hasActiveSave('solitaire', validate, database), true)
})

test('rejects and removes malformed or unsupported saves', async () => {
  const database = new MemoryDatabase()
  database.saves.set('solitaire', { schemaVersion: 99, gameId: 'solitaire', state: { cards: [] } })
  assert.equal(await loadActiveSave('solitaire', validate, database), null)
  assert.equal(database.saves.has('solitaire'), false)
  database.saves.set('solitaire', { schemaVersion: GAME_SAVE_SCHEMA_VERSION, gameId: 'solitaire', sessionId: 's', state: { invalid: true }, createdAt: '2026-01-01', updatedAt: '2026-01-01' })
  assert.equal(await loadActiveSave('solitaire', validate, database), null)
  assert.equal(database.saves.has('solitaire'), false)
})

test('deletes active saves and allows new games to replace them', async () => {
  const database = new MemoryDatabase()
  const first = { cards: ['clubs-A'] }
  const second = { cards: ['hearts-K'] }
  await saveActiveGame('solitaire', first, { sessionId: 'first', createdAt: '2026-01-01T00:00:00.000Z' }, database)
  await saveActiveGame('solitaire', second, { sessionId: 'second', createdAt: '2026-01-02T00:00:00.000Z' }, database)
  assert.deepEqual((await loadActiveSave('solitaire', validate, database))?.state, second)
  assert.equal(await deleteActiveSave('solitaire', database), true)
  assert.equal(await hasActiveSave('solitaire', validate, database), false)
})

test('completed statistics update once per session and retain best move count', async () => {
  const database = new MemoryDatabase()
  await recordGameStarted('solitaire', database)
  await recordGameStarted('solitaire', database)
  await recordGameCompleted('solitaire', 'game-a', 23, database)
  await recordGameCompleted('solitaire', 'game-a', 23, database)
  await recordGameCompleted('solitaire', 'game-b', 17, database)
  assert.deepEqual(await readStatistics('solitaire', database), {
    schemaVersion: 1,
    gameId: 'solitaire',
    gamesStarted: 2,
    gamesCompleted: 2,
    totalMoves: 40,
    bestMoves: 17,
    lastCompletedSessionId: 'game-b',
  })
})

test('storage failures return safe defaults without preventing play', async () => {
  const unavailable: PersistenceDatabase = {
    getSave: async () => { throw new Error('blocked') },
    putSave: async () => { throw new Error('blocked') },
    deleteSave: async () => { throw new Error('blocked') },
    getStatistics: async () => { throw new Error('blocked') },
    putStatistics: async () => { throw new Error('blocked') },
    updateStatistics: async () => { throw new Error('blocked') },
  }
  assert.equal(await loadActiveSave('solitaire', validate, unavailable), null)
  assert.equal(await saveActiveGame('solitaire', { cards: [] }, { sessionId: 's', createdAt: '2026-01-01' }, unavailable), false)
  assert.equal(await deleteActiveSave('solitaire', unavailable), false)
  assert.equal((await readStatistics('solitaire', unavailable)).gamesStarted, 0)
  assert.equal(await recordGameStarted('solitaire', unavailable), null)
})
