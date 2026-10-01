export class UnauthenticatedRequestError extends Error {
  constructor() {
    super('Authentication required')
    this.name = 'UnauthenticatedRequestError'
  }
}

export type VerifiedCaller = {
  userId: string
  deleteOwnAccount(): Promise<void>
}

export type AuthenticateRequest = (request: Request) => Promise<VerifiedCaller>

const allowedOrigins = new Set([
  'https://playadfree.games',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

const corsHeaders = (origin: string | null): HeadersInit => ({
  ...(origin && allowedOrigins.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
  'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
})

const json = (body: Record<string, unknown>, status: number, origin: string | null) =>
  Response.json(body, { status, headers: corsHeaders(origin) })

export const createDeleteAccountHandler = (authenticate: AuthenticateRequest) => async (request: Request) => {
  const origin = request.headers.get('Origin')
  if (origin && !allowedOrigins.has(origin)) {
    return json({ error: 'Request not allowed' }, 403, null)
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, origin)
  }

  // This operation has no request body. Reject supplied identity or other
  // parameters instead of giving them any meaning in the privileged path.
  if (request.body !== null) return json({ error: 'Request body must be empty' }, 400, origin)

  try {
    const caller = await authenticate(request)
    if (!caller.userId) return json({ error: 'Authentication required' }, 401, origin)
    await caller.deleteOwnAccount()
    return json({ deleted: true }, 200, origin)
  } catch (error) {
    if (error instanceof UnauthenticatedRequestError) {
      return json({ error: 'Authentication required' }, 401, origin)
    }
    // Never forward or log Supabase Auth/provider errors.
    return json({ error: 'Account deletion could not be completed' }, 500, origin)
  }
}
