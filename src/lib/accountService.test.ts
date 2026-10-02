import assert from 'node:assert/strict'
import test from 'node:test'
import {
  AccountUnavailableError,
  AccountSessionError,
  createAccountService,
  prepareRemoteProfileFields,
  ProfileConnectionConfirmationError,
  type AccountGateway,
  type RemotePrivateProfile,
  type RemoteProfileFields,
} from './accountService.ts'
import { createBrowserAccountService, createSupabaseAccountGateway } from './supabaseAccountService.ts'
import type { Database } from './database.types.ts'
import type { SupabaseClient } from '@supabase/supabase-js'
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
  const calls: { created: RemoteProfileFields[]; updated: RemoteProfileFields[]; signedOut: number; deleted: number } = {
    created: [],
    updated: [],
    signedOut: 0,
    deleted: 0,
  }
  const gateway: AccountGateway = {
    sendEmailCode: async () => undefined,
    verifyEmailCode: async () => ({ id: 'account-1' }),
    getCurrentUser: async () => null,
    subscribeToAuthChanges: () => () => undefined,
    signOutLocally: async () => { calls.signedOut += 1 },
    deleteOnlineAccount: async () => { calls.deleted += 1 },
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

test('the current seven-game catalogue supports Mahjong as a remote favourite', () => {
  const gameIds = ['solitaire', 'sudoku', 'pairs', 'word-search', 'noughts-crosses', 'fifteen', 'mahjong']
  assert.deepEqual(prepareRemoteProfileFields({ displayName: 'Ada', favouriteGameId: 'mahjong' }, gameIds), {
    display_name: 'Ada',
    favourite_game_id: 'mahjong',
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

test('account service propagates signed-out session errors from its gateway', async () => {
  const { gateway, calls } = makeGateway({ deleteOnlineAccount: async () => { calls.deleted += 1; throw new AccountSessionError() } })
  const service = createAccountService({ url: 'https://project.supabase.co', publishableKey: 'public-key' }, () => gateway)

  await assert.rejects(service.deleteOnlineAccount(), AccountSessionError)
  assert.equal(calls.deleted, 1)
})

test('online account deletion is exposed through the account service', async () => {
  const { gateway, calls } = makeGateway()
  const service = createAccountService({ url: 'https://project.supabase.co', publishableKey: 'public-key' }, () => gateway)

  await service.deleteOnlineAccount()
  assert.equal(calls.deleted, 1)
})

test('online account deletion leaves local profile, game and preference storage untouched', async () => {
  const storage = new MemoryStorage()
  const profile = createLocalProfile({ displayName: 'Ada', favouriteGameId: 'mahjong' }, {
    storage,
    createId: () => 'local-profile-1',
  })!
  storage.setItem('zenplay.game.sudoku.save', '{"board":"local-save"}')
  storage.setItem('zenplay.statistics.sudoku', '{"gamesCompleted":4}')
  storage.setItem('zenplay.settings', '{"highContrast":true}')
  storage.setItem('zenplay.accessibility', '{"reducedMotion":true}')
  const before = new Map(storage.values)
  const { gateway } = makeGateway()
  const service = createAccountService({ url: 'https://project.supabase.co', publishableKey: 'public-key' }, () => gateway)

  await service.deleteOnlineAccount()

  assert.deepEqual(storage.values, before)
  assert.deepEqual(loadLocalProfile(storage), profile)
})

test('online account deletion failure leaves all local storage untouched', async () => {
  const storage = new MemoryStorage()
  createLocalProfile({ displayName: 'Ada', favouriteGameId: 'pairs' }, { storage, createId: () => 'local-profile-2' })
  storage.setItem('zenplay.game.pairs.save', '{"cards":[]}')
  storage.setItem('zenplay.statistics.pairs', '{"gamesCompleted":2}')
  storage.setItem('zenplay.settings', '{"sound":false}')
  storage.setItem('zenplay.accessibility', '{"largeText":true}')
  const before = new Map(storage.values)
  const { gateway } = makeGateway({ deleteOnlineAccount: async () => { throw new Error('server failure') } })
  const service = createAccountService({ url: 'https://project.supabase.co', publishableKey: 'public-key' }, () => gateway)

  await assert.rejects(service.deleteOnlineAccount(), /server failure/)
  assert.deepEqual(storage.values, before)
})

test('browser gateway requires a verified current user and invokes deletion without identity parameters', async () => {
  const events: string[] = []
  const client = {
    auth: {
      getUser: async () => ({ data: { user: { id: 'verified-user' } }, error: null }),
      signOut: async (options: { scope: string }) => { events.push(`signOut:${options.scope}`); return { error: null } },
    },
    functions: {
      invoke: async (...args: unknown[]) => { events.push(JSON.stringify(args)); return { data: { deleted: true }, error: null } },
    },
  } as unknown as SupabaseClient<Database>
  const gateway = createSupabaseAccountGateway(client)

  await gateway.deleteOnlineAccount()
  assert.deepEqual(events, [
    '["delete-account",{"method":"POST"}]',
    'signOut:local',
  ])
})

test('the same email-code request supports new and existing accounts without a redirect', async () => {
  const requests: unknown[] = []
  const client = {
    auth: {
      signInWithOtp: async (request: unknown) => { requests.push(request); return { error: null } },
    },
  } as unknown as SupabaseClient<Database>
  const gateway = createSupabaseAccountGateway(client)

  // Supabase decides whether each email is new or already registered. The app
  // sends the same OTP-first request in either case and never supplies a URL.
  await gateway.sendEmailCode('new-player@example.test')
  await gateway.sendEmailCode('returning-player@example.test')

  assert.deepEqual(requests, [
    { email: 'new-player@example.test', options: { shouldCreateUser: true } },
    { email: 'returning-player@example.test', options: { shouldCreateUser: true } },
  ])
})

test('six-digit email verification uses Supabase email OTP and returns its signed-in user', async () => {
  let verification: unknown
  const client = {
    auth: {
      verifyOtp: async (request: unknown) => {
        verification = request
        return { data: { user: { id: 'signed-in-user' } }, error: null }
      },
    },
  } as unknown as SupabaseClient<Database>
  const gateway = createSupabaseAccountGateway(client)

  assert.deepEqual(await gateway.verifyEmailCode('player@example.test', '123456'), { id: 'signed-in-user' })
  assert.deepEqual(verification, { email: 'player@example.test', token: '123456', type: 'email' })
})

test('browser gateway does not invoke deletion when the session is invalid', async () => {
  let invoked = false
  const client = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    functions: { invoke: async () => { invoked = true; return { data: null, error: null } } },
  } as unknown as SupabaseClient<Database>

  await assert.rejects(createSupabaseAccountGateway(client).deleteOnlineAccount(), AccountSessionError)
  assert.equal(invoked, false)
})

test('function failure leaves the browser session intact for recovery', async () => {
  let signedOut = false
  const client = {
    auth: {
      getUser: async () => ({ data: { user: { id: 'verified-user' } }, error: null }),
      signOut: async () => { signedOut = true; return { error: null } },
    },
    functions: { invoke: async () => ({ data: null, error: new Error('network failure') }) },
  } as unknown as SupabaseClient<Database>

  await assert.rejects(createSupabaseAccountGateway(client).deleteOnlineAccount(), /network failure/)
  assert.equal(signedOut, false)
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
