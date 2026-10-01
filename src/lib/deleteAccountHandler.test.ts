import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createDeleteAccountHandler,
  UnauthenticatedRequestError,
} from '../../supabase/functions/delete-account/handler.ts'

const request = (init: RequestInit = {}) => new Request('https://project.supabase.co/functions/v1/delete-account', init)

test('deletion target comes only from verified caller and response is generic', async () => {
  const deleted: string[] = []
  const handler = createDeleteAccountHandler(async () => ({
    userId: 'verified-user-id',
    deleteOwnAccount: async () => { deleted.push('verified-user-id') },
  }))

  const response = await handler(request({ method: 'POST', headers: { Origin: 'https://playadfree.games' } }))
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { deleted: true })
  assert.deepEqual(deleted, ['verified-user-id'])
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://playadfree.games')
})

test('a client-supplied target is rejected and never reaches deletion', async () => {
  let authenticated = false
  const handler = createDeleteAccountHandler(async () => {
    authenticated = true
    return { userId: 'verified-user-id', deleteOwnAccount: async () => assert.fail('must not delete') }
  })

  const response = await handler(request({ method: 'POST', body: JSON.stringify({ userId: 'someone-else' }) }))
  assert.equal(response.status, 400)
  assert.equal(authenticated, false)
})

test('unauthenticated and invalid sessions receive 401 without deletion', async () => {
  const handler = createDeleteAccountHandler(async () => { throw new UnauthenticatedRequestError() })
  const response = await handler(request({ method: 'POST' }))
  assert.equal(response.status, 401)
  assert.deepEqual(await response.json(), { error: 'Authentication required' })
})

test('server deletion failures return a generic error without exposing provider details', async () => {
  const handler = createDeleteAccountHandler(async () => ({
    userId: 'verified-user-id',
    deleteOwnAccount: async () => { throw new Error('sensitive provider response') },
  }))
  const response = await handler(request({ method: 'POST' }))
  assert.equal(response.status, 500)
  const body = await response.text()
  assert.deepEqual(JSON.parse(body), { error: 'Account deletion could not be completed' })
  assert.equal(body.includes('sensitive provider response'), false)
})

test('only the production and configured local origins receive CORS permission', async () => {
  const handler = createDeleteAccountHandler(async () => assert.fail('origin rejected before authentication'))
  const preflight = await handler(request({ method: 'OPTIONS', headers: { Origin: 'http://localhost:5173' } }))
  assert.equal(preflight.status, 204)
  assert.equal(preflight.headers.get('Access-Control-Allow-Methods'), 'POST, OPTIONS')

  const rejected = await handler(request({ method: 'POST', headers: { Origin: 'https://malicious.example' } }))
  assert.equal(rejected.status, 403)
  assert.equal(rejected.headers.get('Access-Control-Allow-Origin'), null)
})
