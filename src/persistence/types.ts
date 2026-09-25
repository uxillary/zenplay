export const GAME_SAVE_SCHEMA_VERSION = 1
export const STATISTICS_SCHEMA_VERSION = 1

export type GameSave<T = unknown> = {
  schemaVersion: typeof GAME_SAVE_SCHEMA_VERSION
  gameId: string
  sessionId: string
  state: T
  createdAt: string
  updatedAt: string
}

export type GameStatistics = {
  schemaVersion: typeof STATISTICS_SCHEMA_VERSION
  gameId: string
  gamesStarted: number
  gamesCompleted: number
  totalMoves: number
  bestMoves: number | null
  lastCompletedSessionId: string | null
  completionBreakdown: Record<string, number>
}

export type StatisticsInput = Omit<GameStatistics, 'schemaVersion' | 'gameId'>
