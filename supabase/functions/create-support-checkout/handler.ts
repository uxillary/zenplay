import { isSupportOfferId, supportOffers } from '../_shared/supportOffers.ts'

export type CheckoutPayment = { id: string; account_id: string; offer_id: string; amount_minor: number; currency: string }
export type CheckoutDependencies = {
  authenticate(request: Request): Promise<string | null>
  createPayment(input: { accountId: string; offerId: string; amountMinor: number }): Promise<CheckoutPayment>
  updatePayment(id: string, patch: { checkout_session_id?: string }): Promise<void>
  secret(name: string): string | undefined
  stripeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
}

const json = (body: Record<string, unknown>, status: number, origin: string | null) => Response.json(body, {
  status,
  headers: { ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}), Vary: 'Origin' },
})

const allowedOrigins = new Set(['https://playadfree.games', 'http://localhost:5173', 'http://127.0.0.1:5173'])

export const createSupportCheckoutHandler = (deps: CheckoutDependencies) => async (request: Request) => {
  const origin = request.headers.get('Origin')
  if (origin && !allowedOrigins.has(origin)) return json({ error: 'Request not allowed' }, 403, null)
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin',
  } })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, origin)

  let accountId: string | null
  try { accountId = await deps.authenticate(request) } catch { return json({ error: 'Authentication required' }, 401, origin) }
  if (!accountId) return json({ error: 'Authentication required' }, 401, origin)

  let body: unknown
  try { body = await request.json() } catch { return json({ error: 'Invalid request' }, 400, origin) }
  if (!body || typeof body !== 'object' || Array.isArray(body)
    || Object.keys(body).length !== 1 || !isSupportOfferId((body as Record<string, unknown>).offerId)) {
    return json({ error: 'Choose an available support offer' }, 400, origin)
  }
  const offerId = (body as { offerId: keyof typeof supportOffers }).offerId
  const offer = supportOffers[offerId]
  const stripeSecret = deps.secret('STRIPE_SECRET_KEY')
  const priceId = deps.secret(offer.priceSecret)
  const successUrl = deps.secret('STRIPE_CHECKOUT_SUCCESS_URL')
  const cancelUrl = deps.secret('STRIPE_CHECKOUT_CANCEL_URL')
  if (!stripeSecret || !stripeSecret.startsWith('sk_test_') || !priceId || !successUrl || !cancelUrl) {
    return json({ error: 'Checkout is not configured' }, 503, origin)
  }

  try {
    const payment = await deps.createPayment({ accountId, offerId, amountMinor: offer.amountMinor })
    const headers = { Authorization: `Bearer ${stripeSecret}` }
    const priceResponse = await deps.stripeFetch(`https://api.stripe.com/v1/prices/${encodeURIComponent(priceId)}`, { headers })
    if (!priceResponse.ok) throw new Error('Stripe price unavailable')
    const price = await priceResponse.json() as { active?: boolean; currency?: string; unit_amount?: number; livemode?: boolean }
    if (price.active !== true || price.livemode !== false || price.currency !== offer.currency || price.unit_amount !== offer.amountMinor) {
      return json({ error: 'Offer configuration mismatch' }, 503, origin)
    }

    const form = new URLSearchParams({
      mode: 'payment',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: successUrl,
      cancel_url: cancelUrl,
      'metadata[zenplay_payment_id]': payment.id,
      'metadata[zenplay_account_id]': accountId,
      'metadata[zenplay_offer_id]': offerId,
      'payment_intent_data[metadata][zenplay_payment_id]': payment.id,
      'payment_intent_data[metadata][zenplay_account_id]': accountId,
      'payment_intent_data[metadata][zenplay_offer_id]': offerId,
    })
    const response = await deps.stripeFetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded', 'Idempotency-Key': payment.id },
      body: form,
    })
    if (!response.ok) throw new Error('Stripe checkout unavailable')
    const session = await response.json() as { id?: string; url?: string }
    if (!session.id || !session.url || new URL(session.url).hostname !== 'checkout.stripe.com') throw new Error('Invalid checkout response')
    await deps.updatePayment(payment.id, { checkout_session_id: session.id })
    return json({ checkoutUrl: session.url }, 200, origin)
  } catch {
    return json({ error: 'Checkout could not be created' }, 502, origin)
  }
}
