import assert from 'node:assert/strict'
import test from 'node:test'
import { createStripeSupportWebhookHandler } from './handler.ts'
import { verifyStripeSignature } from './signature.ts'

const secret = 'whsec_test'
const signedHeader = async (payload: string, timestamp = 1_800_000_000) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${payload}`)))
  const digest = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return `t=${timestamp},v1=${digest}`
}

test('signature verification rejects missing, invalid and stale signatures', async () => {
  assert.equal(await verifyStripeSignature('{}', null, secret, 1_800_000_000), false)
  assert.equal(await verifyStripeSignature('{}', 't=1800000000,v1=bad', secret, 1_800_000_000), false)
  const valid = await signedHeader('{}')
  assert.equal(await verifyStripeSignature('{}', valid, secret, 1_800_000_000), true)
  assert.equal(await verifyStripeSignature('{}', valid, secret, 1_800_000_500), false)
})

test('missing webhook secret fails closed without persisting an event', async () => {
  let writes = 0
  const handler = createStripeSupportWebhookHandler({ secret: undefined, lookupPayment: async () => null, recordEvent: async () => { writes += 1 } })
  const response = await handler(new Request('https://project.supabase.co/functions/v1/stripe-support-webhook', { method: 'POST', body: '{}' }))
  assert.equal(response.status, 503)
  assert.equal(writes, 0)
})

test('invalid signature cannot create financial state', async () => {
  let writes = 0
  const handler = createStripeSupportWebhookHandler({ secret, lookupPayment: async () => null, recordEvent: async () => { writes += 1 }, nowSeconds: () => 1_800_000_000 })
  const response = await handler(new Request('https://project.supabase.co/functions/v1/stripe-support-webhook', {
    method: 'POST', headers: { 'Stripe-Signature': 't=1800000000,v1=bad' }, body: '{}',
  }))
  assert.equal(response.status, 400)
  assert.equal(writes, 0)
})

test('verified retry uses provider event ID and records normalized amount facts', async () => {
  const payload = JSON.stringify({
    id: 'evt_verified_1', type: 'checkout.session.completed', created: 1_800_000_000, livemode: false,
    data: { object: {
      id: 'cs_test_1', payment_intent: 'pi_test_1', payment_status: 'paid', amount_total: 500, currency: 'gbp',
      metadata: { zenplay_payment_id: 'payment-1', zenplay_account_id: 'account-1', zenplay_offer_id: 'support_5_gbp' },
    } },
  })
  const signature = await signedHeader(payload)
  const recorded: unknown[] = []
  const handler = createStripeSupportWebhookHandler({
    secret, nowSeconds: () => 1_800_000_000,
    lookupPayment: async () => ({ id: 'payment-1', account_id: 'account-1', offer_id: 'support_5_gbp', amount_minor: 500, currency: 'GBP' }),
    recordEvent: async (input) => { recorded.push(input) },
  })
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await handler(new Request('https://project.supabase.co/functions/v1/stripe-support-webhook', {
      method: 'POST', headers: { 'Stripe-Signature': signature }, body: payload,
    }))
    assert.equal(response.status, 200)
  }
  assert.equal(recorded.length, 2) // Database uniqueness makes repeated RPC calls idempotent.
  assert.deepEqual(recorded[0], {
    providerEventId: 'evt_verified_1', providerEventType: 'checkout.session.completed', providerObjectId: 'cs_test_1',
    paymentId: 'payment-1', accountId: 'account-1', eventType: 'payment_succeeded', amountMinor: 500,
    currency: 'GBP', occurredAt: '2027-01-15T08:00:00.000Z', paymentIntentId: 'pi_test_1',
  })
})
