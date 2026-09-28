import assert from 'node:assert/strict'
import test from 'node:test'
import {
  AccountUnavailableError,
  createAccountService,
  prepareRemoteProfileFields,
  ProfileConnectionConfirmationError,
  type AccountGateway,
  type RemotePrivateProfile,
  type RemoteProfileFields,
} from './accountService.ts'
import { createBrowserAccountService } from './supabaseAccountService.ts'
import {
  createLocalProfile,
  loadLocalProfile,
  type ProfileStorage,
} from './localProfile.ts'

class MemoryStorage implements ProfileStorage {
  values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
}

const remoteProfile: RemotePrivateProfile = {
  id: 'account-1',
  display_name: 'Ada',
  favourite_game_id: 'sudoku',
  created_at: '2026-09-28T00:00:00.000Z',
  updated_at: '2026-09-28T00:00:00.000Z',
}

const makeGateway = (overrides: Partial<AccountGateway> = {}) => {
  const calls: { created: RemoteProfileFields[]; updated: RemoteProfileFields[]; signedOut: number } = {
    created: [],
    updated: [],
    signedOut: 0,
  }
  const gateway: AccountGateway = {
    sendEmailCode: async () => undefined,
    verifyEmailCode: async () => ({ id: 'account-1' }),
    getCurrentUser: async () => null,
    subscribeToAuthChanges: () => () => undefined,
    signOutLocally: async () => { calls.signedOut += 1 },
    getPrivateProfile: async () => remoteProfile,
    createPrivateProfile: async (fields) => { calls.created.push(fields); return { ...remoteProfile, ...fields } },
    updatePrivateProfile: async (fields) => { calls.updated.push(fields); return { ...remoteProfile, ...fields } },
    ...overrides,
  }
  return { gateway, calls }
}

test('missing Supabase configuration is safe and reports accounts unavailable', async () => {
  let gatewayCreated = false
  const service = createAccountService({}, () => {
    gatewayCreated = true
    throw new Error('should not run')
  })
  const browserService = createBrowserAccountService({})

  assert.equal(service.configured, false)
  assert.equal(browserService.configured, false)
  assert.equal(gatewayCreated, false)
  await assert.rejects(async () => service.getCurrentUser(), AccountUnavailableError)
})

test('account configuration accepts HTTPS and local development only', () => {
  const factory = () => makeGateway().gateway
  assert.equal(createAccountService({ url: 'https://project.supabase.co', publishableKey: 'sb_publishable_public' }, factory).configured, true)
  assert.equal(createAccountService({ url: 'http://localhost:54321', publishableKey: 'local-key' }, factory).configured, true)
  assert.equal(createAccountService({ url: 'http://example.com', publishableKey: 'key' }, factory).configured, false)
})

test('profile connection requires explicit confirmation and sends only approved fields', async () => {
  const { gateway, calls } = makeGateway()
  const service = createAccountService({ url: 'https://project.supabase.co', publishableKey: 'public-key' }, () => gateway)
  const storage = new MemoryStorage()
  const localProfile = createLocalProfile({ displayName: '  Ada  ', favouriteGameId: 'sudoku' }, {
    storage,
    createId: () => 'device-only-id',
  })!

  await assert.rejects(async () => service.connectLocalProfile(localProfile, { displayName: 'Ada', favouriteGameId: 'sudoku' }, false, ['sudoku']), ProfileConnectionConfirmationError)
  assert.equal(calls.created.length, 0)

  await service.connectLocalProfile(localProfile, { displayName: 'Ada online', favouriteGameId: 'sudoku' }, true, ['sudoku'])
  assert.deepEqual(calls.created, [{ display_name: 'Ada online', favourite_game_id: 'sudoku' }])
  assert.equal(JSON.stringify(calls.created[0]).includes('device-only-id'), false)
  assert.deepEqual(loadLocalProfile(storage), localProfile)
})

test('unsupported local favourite IDs are omitted from the remote profile', () => {
  assert.deepEqual(prepareRemoteProfileFields({ displayName: 'Ada', favouriteGameId: 'removed-game' }, ['solitaire']), {
    display_name: 'Ada',
    favourite_game_id: null,
  })
})

test('sign out and authentication errors leave local profile data untouched', async () => {
  const storage = new MemoryStorage()
  const localProfile = createLocalProfile({ displayName: 'Ada', favouriteGameId: 'pairs' }, {
    storage,
    createId: () => 'local-1',
  })!
  const { gateway, calls } = makeGateway({
    sendEmailCode: async () => { throw new Error('network unavailable') },
  })
  const service = createAccountService({ url: 'https://project.supabase.co', publishableKey: 'public-key' }, () => gateway)

  await assert.rejects(service.sendEmailCode('ada@example.test'))
  assert.equal(loadLocalProfile(storage)?.profileId, localProfile.profileId)
  await service.signOut()
  assert.equal(calls.signedOut, 1)
  assert.deepEqual(loadLocalProfile(storage), localProfile)
})

test('remote profile errors do not alter local profile state', async () => {
  const storage = new MemoryStorage()
  const localProfile = createLocalProfile({ displayName: 'Ada', favouriteGameId: null }, {
    storage,
    createId: () => 'local-2',
  })!
  const { gateway } = makeGateway({ getPrivateProfile: async () => { throw new Error('offline') } })
  const service = createAccountService({ url: 'https://project.supabase.co', publishableKey: 'public-key' }, () => gateway)

  await assert.rejects(service.getPrivateProfile())
  assert.deepEqual(loadLocalProfile(storage), localProfile)
})

test('OTP verification accepts only the configured six-digit code shape', async () => {
  const { gateway } = makeGateway()
  const service = createAccountService({ url: 'https://project.supabase.co', publishableKey: 'public-key' }, () => gateway)
  await assert.rejects(async () => service.verifyEmailCode('ada@example.test', 'abc123'), /six-digit/)
  assert.deepEqual(await service.verifyEmailCode('ada@example.test', '012345'), { id: 'account-1' })
})
