export const LOCAL_PROFILE_SCHEMA_VERSION = 1
export const LOCAL_PROFILE_STORAGE_KEY = 'zenplay-local-profile'
export const PROFILE_NAME_MIN_LENGTH = 2
export const PROFILE_NAME_MAX_LENGTH = 32

export type LocalProfile = {
  schemaVersion: typeof LOCAL_PROFILE_SCHEMA_VERSION
  profileId: string
  displayName: string
  createdAt: string
  favouriteGameId: string | null
  visibility: 'private'
}

export type ProfileInput = {
  displayName: string
  favouriteGameId: string | null
}

export interface ProfileStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export class ProfileValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProfileValidationError'
  }
}

const getBrowserStorage = (): ProfileStorage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export const validateProfileInput = (input: ProfileInput): ProfileInput => {
  const displayName = input.displayName.trim()
  const length = Array.from(displayName).length
  if (length < PROFILE_NAME_MIN_LENGTH || length > PROFILE_NAME_MAX_LENGTH) {
    throw new ProfileValidationError(`Display name must be between ${PROFILE_NAME_MIN_LENGTH} and ${PROFILE_NAME_MAX_LENGTH} characters.`)
  }
  if (Array.from(displayName).some((character) => {
    const codePoint = character.codePointAt(0) ?? 0
    return codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f)
  })) {
    throw new ProfileValidationError('Display name cannot contain control characters.')
  }
  return {
    displayName,
    favouriteGameId: typeof input.favouriteGameId === 'string' && input.favouriteGameId.length > 0
      ? input.favouriteGameId
      : null,
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const parseLocalProfile = (raw: string | null): LocalProfile | null => {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || parsed.version !== LOCAL_PROFILE_SCHEMA_VERSION || !isRecord(parsed.profile)) return null
    const profile = parsed.profile
    if (profile.schemaVersion !== LOCAL_PROFILE_SCHEMA_VERSION
      || typeof profile.profileId !== 'string' || profile.profileId.length === 0
      || typeof profile.displayName !== 'string'
      || typeof profile.createdAt !== 'string' || !Number.isFinite(Date.parse(profile.createdAt))
      || (profile.favouriteGameId !== null && typeof profile.favouriteGameId !== 'string')) return null
    const validated = validateProfileInput({ displayName: profile.displayName, favouriteGameId: profile.favouriteGameId })
    return {
      schemaVersion: LOCAL_PROFILE_SCHEMA_VERSION,
      profileId: profile.profileId,
      displayName: validated.displayName,
      createdAt: profile.createdAt,
      favouriteGameId: validated.favouriteGameId,
      visibility: 'private',
    }
  } catch {
    return null
  }
}

export const loadLocalProfile = (storage: ProfileStorage | null = getBrowserStorage()): LocalProfile | null => {
  try {
    return parseLocalProfile(storage?.getItem(LOCAL_PROFILE_STORAGE_KEY) ?? null)
  } catch {
    return null
  }
}

export const saveLocalProfile = (profile: LocalProfile, storage: ProfileStorage | null = getBrowserStorage()): boolean => {
  if (!storage) return false
  try {
    storage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify({ version: LOCAL_PROFILE_SCHEMA_VERSION, profile }))
    return true
  } catch {
    return false
  }
}

export const createLocalProfile = (
  input: ProfileInput,
  options: { storage?: ProfileStorage | null; now?: () => Date; createId?: () => string } = {},
): LocalProfile | null => {
  const validated = validateProfileInput(input)
  const profile: LocalProfile = {
    schemaVersion: LOCAL_PROFILE_SCHEMA_VERSION,
    profileId: (options.createId ?? (() => globalThis.crypto.randomUUID()))(),
    displayName: validated.displayName,
    createdAt: (options.now ?? (() => new Date()))().toISOString(),
    favouriteGameId: validated.favouriteGameId,
    visibility: 'private',
  }
  return saveLocalProfile(profile, options.storage) ? profile : null
}

export const editLocalProfile = (
  current: LocalProfile,
  input: ProfileInput,
  storage?: ProfileStorage | null,
): LocalProfile | null => {
  const validated = validateProfileInput(input)
  const profile: LocalProfile = { ...current, ...validated }
  return saveLocalProfile(profile, storage) ? profile : null
}

export const deleteLocalProfile = (storage: ProfileStorage | null = getBrowserStorage()): boolean => {
  if (!storage) return false
  try {
    storage.removeItem(LOCAL_PROFILE_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
