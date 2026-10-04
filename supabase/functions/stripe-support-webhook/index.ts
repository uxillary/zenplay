import { createSupabaseContext } from 'npm:@supabase/server@1'
import { createStripeSupportWebhookHandler } from './handler.ts'

declare const Deno: { serve(handler: (request: Request) => Response | Promise<Response>): void; env: { get(name: string): string | undefined } }

Deno.serve(async (request) => {
  const { data: context, error } = await createSupabaseContext(request, { auth: 'none' })
  if (error || !context) return Response.json({ error: 'Webhook is not configured' }, { status: 503 })
  const admin = context.supabaseAdmin
  const handler = createStripeSupportWebhookHandler({
    secret: Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET'),
    async lookupPayment(query) {
      let select = admin.from('support_payments').select('id, account_id, offer_id, amount_minor, currency')
      select = query.id ? select.eq('id', query.id) : select.eq('payment_intent_id', query.paymentIntentId!)
      const { data, error: lookupError } = await select.maybeSingle()
      if (lookupError) throw lookupError
      return data
    },
    async recordEvent(event) {
      const { error: rpcError } = await admin.rpc('record_verified_support_payment_event', {
        p_provider_event_id: event.providerEventId,
        p_provider_event_type: event.providerEventType,
        p_provider_object_id: event.providerObjectId,
        p_payment_id: event.paymentId,
        p_account_id: event.accountId,
        p_event_type: event.eventType,
        p_amount_minor: event.amountMinor,
        p_currency: event.currency,
        p_occurred_at: event.occurredAt,
        p_payment_intent_id: event.paymentIntentId,
      })
      if (rpcError) throw rpcError
    },
  })
  return handler(request)
})
