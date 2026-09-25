import { localDatabase, type PersistenceDatabase } from './database.ts'
import { GAME_SAVE_SCHEMA_VERSION, type GameSave } from './types.ts'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const validTimestamp = (value: unknown): value is string =>
  typeof value === 'string' && Number.isFinite(Date.parse(value))

const isSaveEnvelope = (value: unknown, gameId: string): value is GameSave => {
  if (!isRecord(value)) return false
  return value.schemaVersion === GAME_SAVE_SCHEMA_VERSION
    && value.gameId === gameId
    && typeof value.sessionId === 'string'
    && value.sessionId.length > 0
    && validTimestamp(value.createdAt)
    && validTimestamp(value.updatedAt)
    && 'state' in value
}

export const createSessionId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const loadActiveSave = async <T,>(
  gameId: string,
  validateState: (value: unknown) => value is T,
  database: PersistenceDatabase = localDatabase,
): Promise<GameSave<T> | null> => {
  try {
    const raw = await database.getSave(gameId)
    if (raw === undefined) return null
    if (isSaveEnvelope(raw, gameId) && validateState(raw.state)) return raw as GameSave<T>
    await database.deleteSave(gameId).catch(() => undefined)
    return null
  } catch {
    return null
  }
}

export const saveActiveGame = async <T,>(
  gameId: string,
  state: T,
  session: { sessionId: string; createdAt: string },
  database: PersistenceDatabase = localDatabase,
  now = new Date().toISOString(),
): Promise<boolean> => {
  try {
    const save: GameSave<T> = {
      schemaVersion: GAME_SAVE_SCHEMA_VERSION,
      gameId,
      sessionId: session.sessionId,
      state,
      createdAt: session.createdAt,
      updatedAt: now,
    }
    await database.putSave(save)
    return true
  } catch {
    return false
  }
}

export const deleteActiveSave = async (
  gameId: string,
  database: PersistenceDatabase = localDatabase,
): Promise<boolean> => {
  try {
    await database.deleteSave(gameId)
    return true
  } catch {
    return false
  }
}

export const hasActiveSave = async <T,>(
  gameId: string,
  validateState: (value: unknown) => value is T,
  database: PersistenceDatabase = localDatabase,
): Promise<boolean> => (await loadActiveSave(gameId, validateState, database)) !== null
