import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  createAccountService,
  type AccountConfiguration,
  type AccountGateway,
  AccountSessionError,
  type AccountUser,
  type RemotePrivateProfile,
  type RemoteProfileFields,
} from './accountService.ts'
import type { Database } from './database.types.ts'

const profileColumns = 'id, display_name, favourite_game_id, created_at, updated_at'

const throwIfError = (error: { message: string } | null) => {
  if (error) throw error
}

export const createSupabaseAccountGateway = (client: SupabaseClient<Database>): AccountGateway => ({
  async sendEmailCode(email) {
    const { error } = await client.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
    throwIfError(error)
  },

  async verifyEmailCode(email, code): Promise<AccountUser> {
    const { data, error } = await client.auth.verifyOtp({ email, token: code, type: 'email' })
    throwIfError(error)
    if (!data.user) throw new Error('The sign-in code could not be verified.')
    return { id: data.user.id }
  },

  async getCurrentUser() {
    // This session snapshot drives presentation only. Postgres RLS remains the authority for every row access.
    const { data, error } = await client.auth.getSession()
    throwIfError(error)
    return data.session?.user ? { id: data.session.user.id } : null
  },

  subscribeToAuthChanges(listener) {
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      listener(session?.user ? { id: session.user.id } : null)
    })
    return () => data.subscription.unsubscribe()
  },

  async signOutLocally() {
    // Each device/browser keeps its own session; signing out here must not revoke other devices.
    const { error } = await client.auth.signOut({ scope: 'local' })
    throwIfError(error)
  },

  async deleteOnlineAccount() {
    const { data, error: authError } = await client.auth.getUser()
    if (authError) {
      if (
        authError.name === 'AuthSessionMissingError'
        || ('status' in authError && (authError.status === 401 || authError.status === 403))
      ) throw new AccountSessionError()
      throw authError
    }
    if (!data.user) throw new AccountSessionError()

    const { error } = await client.functions.invoke('delete-account', { method: 'POST' })
    if (error) {
      const status = error.context instanceof Response ? error.context.status : undefined
      if (status === 401 || status === 403) throw new AccountSessionError()
      throw error
    }

    // The server has confirmed deletion. Clear this browser's persisted session;
    // Auth deletion does not immediately erase its already-issued JWT.
    const { error: signOutError } = await client.auth.signOut({ scope: 'local' })
    throwIfError(signOutError)
  },

  async getPrivateProfile(): Promise<RemotePrivateProfile | null> {
    const { data, error } = await client
      .from('private_profiles')
      .select(profileColumns)
      .maybeSingle()
    throwIfError(error)
    return data
  },

  async createPrivateProfile(fields: RemoteProfileFields): Promise<RemotePrivateProfile> {
    const { data, error } = await client
      .from('private_profiles')
      .insert(fields)
      .select(profileColumns)
      .single()
    throwIfError(error)
    if (!data) throw new Error('The private profile was not returned after creation.')
    return data
  },

  async updatePrivateProfile(fields: RemoteProfileFields): Promise<RemotePrivateProfile> {
    const { data: authData, error: authError } = await client.auth.getUser()
    throwIfError(authError)
    if (!authData.user) throw new Error('Sign in to update the account profile.')

    const { data, error } = await client
      .from('private_profiles')
      .update(fields)
      .eq('id', authData.user.id)
      .select(profileColumns)
      .single()
    throwIfError(error)
    if (!data) throw new Error('The private profile was not returned after update.')
    return data
  },
})

export const readSupabaseConfiguration = (): AccountConfiguration => ({
  url: import.meta.env.VITE_SUPABASE_URL,
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
})

export const createBrowserAccountService = (
  configuration: AccountConfiguration = readSupabaseConfiguration(),
) => createAccountService(configuration, () => {
  const client = createClient<Database>(configuration.url!.trim(), configuration.publishableKey!.trim(), {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      // M13E uses code entry, not a redirect-based sign-in flow.
      detectSessionInUrl: false,
    },
  })
  return createSupabaseAccountGateway(client)
})
