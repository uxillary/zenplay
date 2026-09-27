import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createLocalProfile,
  deleteLocalProfile,
  editLocalProfile,
  loadLocalProfile,
  LOCAL_PROFILE_SCHEMA_VERSION,
  LOCAL_PROFILE_STORAGE_KEY,
  parseLocalProfile,
  ProfileValidationError,
  validateProfileInput,
  type ProfileStorage,
} from './localProfile.ts'

class MemoryStorage implements ProfileStorage {
  values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
}

test('creates and reloads a versioned private profile with an optional favourite game', () => {
  const storage = new MemoryStorage()
  const profile = createLocalProfile({ displayName: '  Ada  ', favouriteGameId: 'sudoku' }, {
    storage,
    createId: () => 'local-profile-1',
    now: () => new Date('2026-09-27T10:00:00.000Z'),
  })
  assert.deepEqual(profile, {
    schemaVersion: LOCAL_PROFILE_SCHEMA_VERSION,
    profileId: 'local-profile-1',
    displayName: 'Ada',
    createdAt: '2026-09-27T10:00:00.000Z',
    favouriteGameId: 'sudoku',
    visibility: 'private',
  })
  assert.deepEqual(loadLocalProfile(storage), profile)
  assert.equal(JSON.parse(storage.getItem(LOCAL_PROFILE_STORAGE_KEY)!).version, LOCAL_PROFILE_SCHEMA_VERSION)
})

test('accepts no favourite game and rejects invalid display names', () => {
  const storage = new MemoryStorage()
  const profile = createLocalProfile({ displayName: 'Jo', favouriteGameId: null }, {
    storage,
    createId: () => 'profile-2',
    now: () => new Date('2026-01-01T00:00:00.000Z'),
  })
  assert.equal(profile?.favouriteGameId, null)
  assert.throws(() => validateProfileInput({ displayName: ' ', favouriteGameId: null }), ProfileValidationError)
  assert.throws(() => validateProfileInput({ displayName: 'A', favouriteGameId: null }), /between 2 and 32/)
  assert.throws(() => validateProfileInput({ displayName: 'A\nB', favouriteGameId: null }), /control characters/)
  assert.throws(() => validateProfileInput({ displayName: 'x'.repeat(33), favouriteGameId: null }), ProfileValidationError)
})

test('edits allowed fields while preserving the stable ID and created date', () => {
  const storage = new MemoryStorage()
  const current = createLocalProfile({ displayName: 'Ada', favouriteGameId: null }, {
    storage,
    createId: () => 'stable-id',
    now: () => new Date('2026-01-01T00:00:00.000Z'),
  })!
  const edited = editLocalProfile(current, { displayName: 'Ada Lovelace', favouriteGameId: 'mahjong' }, storage)
  assert.equal(edited?.profileId, 'stable-id')
  assert.equal(edited?.createdAt, current.createdAt)
  assert.equal(edited?.displayName, 'Ada Lovelace')
  assert.equal(edited?.favouriteGameId, 'mahjong')
  assert.deepEqual(loadLocalProfile(storage), edited)
})

test('deletes only the local profile record', () => {
  const storage = new MemoryStorage()
  storage.setItem(LOCAL_PROFILE_STORAGE_KEY, 'profile')
  storage.setItem('zenplay-settings', 'settings')
  assert.equal(deleteLocalProfile(storage), true)
  assert.equal(loadLocalProfile(storage), null)
  assert.equal(storage.getItem('zenplay-settings'), 'settings')
})

test('recovers from malformed and unsupported stored profile data', () => {
  assert.equal(parseLocalProfile('{'), null)
  assert.equal(parseLocalProfile(JSON.stringify({ version: 99, profile: {} })), null)
  assert.equal(parseLocalProfile(JSON.stringify({ version: 1, profile: { profileId: '', displayName: 'Ada' } })), null)
  const legacyUnknownGame = JSON.stringify({ version: 1, profile: {
    schemaVersion: 1,
    profileId: 'id',
    displayName: 'Ada',
    createdAt: '2026-01-01T00:00:00.000Z',
    favouriteGameId: 'removed-game',
    visibility: 'public',
  } })
  assert.equal(parseLocalProfile(legacyUnknownGame)?.favouriteGameId, 'removed-game')
  assert.equal(parseLocalProfile(legacyUnknownGame)?.visibility, 'private')
})

test('fails safely when storage is unavailable or throws', () => {
  assert.equal(loadLocalProfile(null), null)
  const blocked: ProfileStorage = {
    getItem: () => { throw new Error('blocked') },
    setItem: () => { throw new Error('blocked') },
    removeItem: () => { throw new Error('blocked') },
  }
  assert.equal(loadLocalProfile(blocked), null)
  assert.equal(createLocalProfile({ displayName: 'Ada', favouriteGameId: null }, { storage: blocked }), null)
  assert.equal(deleteLocalProfile(blocked), false)
})
