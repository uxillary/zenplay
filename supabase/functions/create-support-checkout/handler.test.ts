import assert from 'node:assert/strict'
import test from 'node:test'
import { createSupportCheckoutHandler } from './handler.ts'

const request = (body: unknown, init: RequestInit = {}) => new Request('https://project.supabase.co/functions/v1/create-support-checkout', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), ...init,
})

test('checkout requires a verified account', async () => {
  const handler = createSupportCheckoutHandler({
    authenticate: async () => null,
    createPayment: async () => assert.fail('must not create payment'),
    updatePayment: async () => {}, secret: () => 'configured', stripeFetch: async () => assert.fail('must not call Stripe'),
  })
  assert.equal((await handler(request({ offerId: 'support_2_gbp' }))).status, 401)
})

test('only a canonical offer identifier is accepted; client amounts and currencies are rejected', async () => {
  const handler = createSupportCheckoutHandler({
    authenticate: async () => 'authenticated-account',
    createPayment: async () => assert.fail('must not create payment'),
    updatePayment: async () => {}, secret: () => 'configured', stripeFetch: async () => assert.fail('must not call Stripe'),
  })
  assert.equal((await handler(request({ offerId: 'support_2_gbp', amount: 1, currency: 'USD' }))).status, 400)
  assert.equal((await handler(request({ amount: 200, currency: 'GBP' }))).status, 400)
  assert.equal((await handler(request({ offerId: 'price_123' }))).status, 400)
})

test('checkout stays disabled until server-side Stripe configuration exists', async () => {
  const handler = createSupportCheckoutHandler({
    authenticate: async () => 'authenticated-account',
    createPayment: async () => assert.fail('must not create payment before config'),
    updatePayment: async () => {}, secret: () => undefined, stripeFetch: async () => assert.fail('must not call Stripe'),
  })
  const response = await handler(request({ offerId: 'support_2_gbp' }))
  assert.equal(response.status, 503)
})

test('live Stripe API keys are rejected by this test-only foundation', async () => {
  const handler = createSupportCheckoutHandler({
    authenticate: async () => 'authenticated-account',
    createPayment: async () => assert.fail('must not create payment'),
    updatePayment: async () => {}, secret: (name) => name === 'STRIPE_SECRET_KEY' ? 'sk_live_never-use' : 'configured',
    stripeFetch: async () => assert.fail('must not call Stripe'),
  })
  assert.equal((await handler(request({ offerId: 'support_2_gbp' }))).status, 503)
})

test('server maps the offer, account and configured Stripe Price to hosted Checkout', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const handler = createSupportCheckoutHandler({
    authenticate: async () => 'verified-account',
    createPayment: async (input) => {
      assert.deepEqual(input, { accountId: 'verified-account', offerId: 'support_5_gbp', amountMinor: 500 })
      return { id: 'payment-id', account_id: 'verified-account', offer_id: input.offerId, amount_minor: 500, currency: 'GBP' }
    },
    updatePayment: async (id, patch) => { assert.equal(id, 'payment-id'); assert.deepEqual(patch, { checkout_session_id: 'cs_test_id' }) },
    secret: (name) => ({
      STRIPE_SECRET_KEY: 'sk_test_server_only', STRIPE_PRICE_SUPPORT_5_GBP: 'price_server_configured',
      STRIPE_CHECKOUT_SUCCESS_URL: 'https://playadfree.games/support/return',
      STRIPE_CHECKOUT_CANCEL_URL: 'https://playadfree.games/support',
    } as Record<string, string>)[name],
    stripeFetch: async (input, init) => {
      calls.push({ url: String(input), init })
      return calls.length === 1
        ? Response.json({ active: true, livemode: false, currency: 'gbp', unit_amount: 500 })
        : Response.json({ id: 'cs_test_id', url: 'https://checkout.stripe.com/c/pay/cs_test_id' })
    },
  })
  const response = await handler(request({ offerId: 'support_5_gbp' }))
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test_id' })
  assert.equal(calls.length, 2)
  const form = new URLSearchParams(String(calls[1].init?.body))
  assert.equal(form.get('line_items[0][price]'), 'price_server_configured')
  assert.equal(form.get('metadata[zenplay_account_id]'), 'verified-account')
  assert.equal(form.get('metadata[zenplay_offer_id]'), 'support_5_gbp')
  assert.equal(calls[1].init?.headers instanceof Object, true)
})
