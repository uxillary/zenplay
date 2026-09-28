import {
  validateProfileInput,
  type LocalProfile,
  type ProfileInput,
} from './localProfile.ts'

export type AccountUser = { id: string }

export type RemoteProfileFields = {
  display_name: string
  favourite_game_id: string | null
}

export type RemotePrivateProfile = RemoteProfileFields & {
  id: string
  created_at: string
  updated_at: string
}

export type AccountConfiguration = {
  url?: string | null
  publishableKey?: string | null
}

export interface AccountGateway {
  sendEmailCode(email: string): Promise<void>
  verifyEmailCode(email: string, code: string): Promise<AccountUser>
  getCurrentUser(): Promise<AccountUser | null>
  subscribeToAuthChanges(listener: (user: AccountUser | null) => void): () => void
  signOutLocally(): Promise<void>
  getPrivateProfile(): Promise<RemotePrivateProfile | null>
  createPrivateProfile(fields: RemoteProfileFields): Promise<RemotePrivateProfile>
  updatePrivateProfile(fields: RemoteProfileFields): Promise<RemotePrivateProfile>
}

export class AccountUnavailableError extends Error {
  constructor() {
    super('Online accounts are not configured for this ZenPlay build.')
    this.name = 'AccountUnavailableError'
  }
}

export class ProfileConnectionConfirmationError extends Error {
  constructor() {
    super('Confirm which local profile details to connect first.')
    this.name = 'ProfileConnectionConfirmationError'
  }
}

export const isAccountConfigurationValid = (configuration: AccountConfiguration): boolean => {
  const url = configuration.url?.trim()
  const publishableKey = configuration.publishableKey?.trim()
  if (!url || !publishableKey) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
      || parsed.hostname === 'localhost'
      || parsed.hostname === '127.0.0.1'
  } catch {
    return false
  }
}

export const prepareRemoteProfileFields = (
  input: ProfileInput,
  allowedGameIds: readonly string[],
): RemoteProfileFields => {
  const validated = validateProfileInput(input)
  const favouriteGameId = validated.favouriteGameId
  return {
    display_name: validated.displayName,
    favourite_game_id: favouriteGameId && allowedGameIds.includes(favouriteGameId)
      ? favouriteGameId
      : null,
  }
}

export const createAccountService = (
  configuration: AccountConfiguration,
  createGateway: () => AccountGateway,
) => {
  const configured = isAccountConfigurationValid(configuration)
  let gateway: AccountGateway | null = null
  if (configured) {
    try {
      gateway = createGateway()
    } catch {
      gateway = null
    }
  }

  const requireGateway = (): AccountGateway => {
    if (!gateway) throw new AccountUnavailableError()
    return gateway
  }

  return {
    configured: configured && gateway !== null,
    sendEmailCode: (email: string) => requireGateway().sendEmailCode(email.trim()),
    verifyEmailCode: (email: string, code: string) => {
      const normalizedCode = code.trim()
      if (!/^\d{6}$/.test(normalizedCode)) throw new Error('Enter the six-digit sign-in code.')
      return requireGateway().verifyEmailCode(email.trim(), normalizedCode)
    },
    getCurrentUser: () => requireGateway().getCurrentUser(),
    subscribeToAuthChanges: (listener: (user: AccountUser | null) => void) =>
      gateway?.subscribeToAuthChanges(listener) ?? (() => undefined),
    signOut: () => requireGateway().signOutLocally(),
    getPrivateProfile: () => requireGateway().getPrivateProfile(),
    connectLocalProfile: (
      profile: LocalProfile | null,
      input: ProfileInput,
      confirmed: boolean,
      allowedGameIds: readonly string[],
    ) => {
      if (!confirmed) throw new ProfileConnectionConfirmationError()
      if (!profile) throw new Error('Create a local profile before connecting it.')
      const fields = prepareRemoteProfileFields(input, allowedGameIds)
      return requireGateway().createPrivateProfile(fields)
    },
    updatePrivateProfile: (input: ProfileInput, allowedGameIds: readonly string[]) => {
      const fields = prepareRemoteProfileFields(input, allowedGameIds)
      return requireGateway().updatePrivateProfile(fields)
    },
  }
}

export type AccountService = ReturnType<typeof createAccountService>
