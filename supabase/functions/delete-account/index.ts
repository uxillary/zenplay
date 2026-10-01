import { createSupabaseContext } from 'npm:@supabase/server@1'
import { createDeleteAccountHandler, UnauthenticatedRequestError } from './handler.ts'

declare const Deno: { serve(handler: (request: Request) => Response | Promise<Response>): void }

const handler = createDeleteAccountHandler(async (request) => {
  const { data: context, error } = await createSupabaseContext(request, { auth: 'user' })
  if (error) {
    if (error.status === 401 || error.status === 403) throw new UnauthenticatedRequestError()
    throw new Error('Unable to verify caller')
  }

  const { data: userData, error: userError } = await context.supabase.auth.getUser()
  if (userError) {
    if (
      userError.name === 'AuthSessionMissingError'
      || ('status' in userError && (userError.status === 401 || userError.status === 403))
    ) {
      throw new UnauthenticatedRequestError()
    }
    throw new Error('Unable to resolve caller')
  }
  const userId = userData.user?.id
  if (typeof userId !== 'string' || userId.length === 0) throw new UnauthenticatedRequestError()

  return {
    userId,
    async deleteOwnAccount() {
      const { error: deleteError } = await context.supabaseAdmin.auth.admin.deleteUser(userId)
      if (deleteError) throw new Error('Account deletion failed')
    },
  }
})

Deno.serve(handler)
