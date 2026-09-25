import { localDatabase, type PersistenceDatabase } from './database.ts'
import { STATISTICS_SCHEMA_VERSION, type GameStatistics } from './types.ts'

const emptyStatistics = (gameId: string): GameStatistics => ({
  schemaVersion: STATISTICS_SCHEMA_VERSION,
  gameId,
  gamesStarted: 0,
  gamesCompleted: 0,
  totalMoves: 0,
  bestMoves: null,
  lastCompletedSessionId: null,
  completionBreakdown: {},
})

const isNonNegativeInteger = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0

const parseStatistics = (value: unknown, gameId: string): GameStatistics => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return emptyStatistics(gameId)
  const source = value as Record<string, unknown>
  if (source.schemaVersion !== STATISTICS_SCHEMA_VERSION || source.gameId !== gameId) return emptyStatistics(gameId)
  return {
    ...emptyStatistics(gameId),
    gamesStarted: isNonNegativeInteger(source.gamesStarted) ? source.gamesStarted : 0,
    gamesCompleted: isNonNegativeInteger(source.gamesCompleted) ? source.gamesCompleted : 0,
    totalMoves: isNonNegativeInteger(source.totalMoves) ? source.totalMoves : 0,
    bestMoves: source.bestMoves === null || isNonNegativeInteger(source.bestMoves) ? source.bestMoves as number | null : null,
    lastCompletedSessionId: typeof source.lastCompletedSessionId === 'string' ? source.lastCompletedSessionId : null,
    completionBreakdown: typeof source.completionBreakdown === 'object' && source.completionBreakdown !== null && !Array.isArray(source.completionBreakdown)
      ? Object.fromEntries(Object.entries(source.completionBreakdown).filter((entry): entry is [string, number] => isNonNegativeInteger(entry[1])))
      : {},
  }
}

const updateStatistics = async (
  gameId: string,
  update: (current: GameStatistics) => GameStatistics,
  database: PersistenceDatabase,
): Promise<GameStatistics | null> => {
  try {
    return await database.updateStatistics(gameId, (raw) => update(parseStatistics(raw, gameId)))
  } catch {
    return null
  }
}

export const readStatistics = async (
  gameId: string,
  database: PersistenceDatabase = localDatabase,
): Promise<GameStatistics> => {
  try {
    return parseStatistics(await database.getStatistics(gameId), gameId)
  } catch {
    return emptyStatistics(gameId)
  }
}

export const recordGameStarted = (
  gameId: string,
  database: PersistenceDatabase = localDatabase,
): Promise<GameStatistics | null> => updateStatistics(
  gameId,
  (current) => ({ ...current, gamesStarted: current.gamesStarted + 1 }),
  database,
)

export const recordGameCompleted = (
  gameId: string,
  sessionId: string,
  moves: number,
  database: PersistenceDatabase = localDatabase,
  category?: string,
): Promise<GameStatistics | null> => updateStatistics(
  gameId,
  (current) => current.lastCompletedSessionId === sessionId
    ? current
    : {
        ...current,
        gamesCompleted: current.gamesCompleted + 1,
        totalMoves: current.totalMoves + moves,
        bestMoves: current.bestMoves === null ? moves : Math.min(current.bestMoves, moves),
        lastCompletedSessionId: sessionId,
        completionBreakdown: category
          ? { ...current.completionBreakdown, [category]: (current.completionBreakdown[category] ?? 0) + 1 }
          : current.completionBreakdown,
      },
  database,
)
