import { createSupabaseContext } from 'npm:@supabase/server@1'
import { createSupportCheckoutHandler } from './handler.ts'

declare const Deno: { serve(handler: (request: Request) => Response | Promise<Response>): void; env: { get(name: string): string | undefined } }

const serve = async (request: Request) => {
  const origin = request.headers.get('Origin')
  const allowedOrigins = new Set(['https://playadfree.games', 'http://localhost:5173', 'http://127.0.0.1:5173'])
  if (origin && !allowedOrigins.has(origin)) return Response.json({ error: 'Request not allowed' }, { status: 403 })
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin',
  } })
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })

  const { data: context, error } = await createSupabaseContext(request, { auth: 'user' })
  if (error || !context) return Response.json({ error: 'Authentication required' }, { status: 401 })
  const admin = context.supabaseAdmin
  const handler = createSupportCheckoutHandler({
    async authenticate() {
      const { data, error: userError } = await context.supabase.auth.getUser()
      if (userError) return null
      return data.user?.id ?? null
    },
    async createPayment(input) {
      const { data, error: insertError } = await admin.from('support_payments').insert({
        account_id: input.accountId,
        offer_id: input.offerId,
        amount_minor: input.amountMinor,
        currency: 'GBP',
        provider: 'stripe',
        status: 'initiated',
      }).select('id, account_id, offer_id, amount_minor, currency').single()
      if (insertError || !data) throw new Error('Payment intent could not be created')
      return data
    },
    async updatePayment(id, patch) {
      const { error: updateError } = await admin.from('support_payments').update(patch).eq('id', id)
      if (updateError) throw new Error('Payment intent could not be updated')
    },
    secret: (name) => Deno.env.get(name),
    stripeFetch: (input, init) => fetch(input, init),
  })
  return handler(request)
}

Deno.serve(serve)
