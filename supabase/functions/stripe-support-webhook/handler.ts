import { verifyStripeSignature } from './signature.ts'

type PaymentRecord = { id: string; account_id: string | null; offer_id: string; amount_minor: number; currency: string }
type NormalizedEvent = 'payment_initiated' | 'payment_succeeded' | 'payment_failed' | 'payment_cancelled'
  | 'refund_partial' | 'refund_full' | 'dispute_opened' | 'dispute_won' | 'dispute_lost'
type JsonObject = Record<string, unknown>
type EventInput = {
  providerEventId: string; providerEventType: string; providerObjectId: string | null
  paymentId: string | null; accountId: string | null; eventType: NormalizedEvent
  amountMinor: number | null; currency: string | null; occurredAt: string; paymentIntentId: string | null
}

export type WebhookDependencies = {
  secret: string | undefined
  lookupPayment(query: { id?: string; paymentIntentId?: string }): Promise<PaymentRecord | null>
  recordEvent(input: EventInput): Promise<void>
  nowSeconds?: () => number
}

const respond = (status: number, body: Record<string, unknown>) => Response.json(body, { status })
const asObject = (value: unknown): JsonObject | null => value && typeof value === 'object' && !Array.isArray(value)
  ? value as JsonObject : null

const normalized = (type: string, object: JsonObject): { type: NormalizedEvent; amount: number | null; currency: string | null } | null => {
  const currency = typeof object.currency === 'string' ? object.currency.toUpperCase() : null
  const amount = (key: string) => typeof object[key] === 'number' ? object[key] as number : null
  const paymentStatus = typeof object.payment_status === 'string' ? object.payment_status : ''
  const disputeStatus = typeof object.status === 'string' ? object.status : ''
  switch (type) {
    case 'checkout.session.completed':
      return { type: paymentStatus === 'paid' ? 'payment_succeeded' : 'payment_initiated', amount: amount('amount_total'), currency }
    case 'checkout.session.async_payment_succeeded': return { type: 'payment_succeeded', amount: amount('amount_total'), currency }
    case 'checkout.session.async_payment_failed': return { type: 'payment_failed', amount: amount('amount_total'), currency }
    case 'checkout.session.expired': return { type: 'payment_cancelled', amount: amount('amount_total'), currency }
    case 'payment_intent.succeeded': return { type: 'payment_succeeded', amount: amount('amount_received') ?? amount('amount'), currency }
    case 'payment_intent.payment_failed': return { type: 'payment_failed', amount: amount('amount'), currency }
    case 'charge.refunded': {
      const refunded = amount('amount_refunded')
      const chargeAmount = amount('amount')
      return { type: refunded !== null && chargeAmount !== null && refunded >= chargeAmount ? 'refund_full' : 'refund_partial', amount: refunded, currency }
    }
    case 'charge.dispute.created': return { type: 'dispute_opened', amount: amount('amount'), currency }
    case 'charge.dispute.closed':
      if (disputeStatus === 'won') return { type: 'dispute_won', amount: amount('amount'), currency }
      if (disputeStatus === 'lost') return { type: 'dispute_lost', amount: amount('amount'), currency }
      return null
    default: return null
  }
}

export const createStripeSupportWebhookHandler = (deps: WebhookDependencies) => async (request: Request) => {
  if (request.method !== 'POST') return respond(405, { error: 'Method not allowed' })
  if (!deps.secret) return respond(503, { error: 'Webhook is not configured' })
  const rawBody = await request.text()
  if (!await verifyStripeSignature(rawBody, request.headers.get('Stripe-Signature'), deps.secret, deps.nowSeconds?.())) {
    return respond(400, { error: 'Invalid signature' })
  }

  let event: JsonObject | null
  try { event = asObject(JSON.parse(rawBody)) } catch { return respond(400, { error: 'Invalid event' }) }
  const data = asObject(event?.data)
  const object = asObject(data?.object)
  if (!event || !object || typeof event.id !== 'string' || typeof event.type !== 'string'
    || !Number.isInteger(event.created) || event.livemode !== false) {
    return respond(400, { error: 'Invalid event' })
  }
  const fact = normalized(event.type, object)
  if (!fact) return respond(200, { received: true, ignored: true })

  const metadata = asObject(object.metadata) ?? {}
  const paymentIntent = asObject(object.payment_intent)
  const paymentIntentId = typeof object.payment_intent === 'string' ? object.payment_intent
    : typeof paymentIntent?.id === 'string' ? paymentIntent.id
      : typeof object.id === 'string' && object.id.startsWith('pi_') ? object.id : null
  let payment: PaymentRecord | null = null
  if (typeof metadata.zenplay_payment_id === 'string') payment = await deps.lookupPayment({ id: metadata.zenplay_payment_id })
  else if (paymentIntentId) payment = await deps.lookupPayment({ paymentIntentId })

  if (payment && typeof metadata.zenplay_payment_id === 'string') {
    const offerAmount: Record<string, number> = { support_2_gbp: 200, support_5_gbp: 500, support_10_gbp: 1000 }
    if (metadata.zenplay_payment_id !== payment.id || metadata.zenplay_account_id !== payment.account_id
      || metadata.zenplay_offer_id !== payment.offer_id || offerAmount[payment.offer_id] !== payment.amount_minor) {
      return respond(400, { error: 'Payment metadata mismatch' })
    }
  }
  if (payment && fact.amount !== null && (fact.currency !== 'GBP' || fact.amount < 0 || fact.amount > payment.amount_minor)) {
    return respond(400, { error: 'Payment facts mismatch' })
  }
  if (payment && ['payment_succeeded', 'payment_initiated'].includes(fact.type)
    && (fact.amount !== payment.amount_minor || fact.currency !== 'GBP')) return respond(400, { error: 'Payment facts mismatch' })

  try {
    await deps.recordEvent({
      providerEventId: event.id,
      providerEventType: event.type,
      providerObjectId: typeof object.id === 'string' ? object.id : null,
      paymentId: payment?.id ?? null,
      accountId: payment?.account_id ?? null,
      eventType: fact.type,
      amountMinor: fact.amount,
      currency: fact.currency,
      occurredAt: new Date((event.created as number) * 1000).toISOString(),
      paymentIntentId,
    })
    return respond(200, { received: true })
  } catch {
    return respond(500, { error: 'Event could not be recorded' })
  }
}
