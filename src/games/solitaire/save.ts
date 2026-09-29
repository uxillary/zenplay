import { deleteActiveSave, loadActiveSave, type ActiveSaveLoadResult, type ContinueAvailability } from '../../persistence/gameSave.ts'
import { recordGameCompleted } from '../../persistence/statistics.ts'
import { isResumableSolitaireState, isSolitaireState } from './model/persistence.ts'
import { isWin } from './model/rules.ts'
import type { SolitaireState } from './model/types.ts'
import type { DrawMode } from '../../lib/settings.ts'

export type SolitaireSaveState = { gameState: SolitaireState; drawMode: DrawMode }

export const isSolitaireSaveState = (value: unknown): value is SolitaireSaveState =>
  typeof value === 'object'
  && value !== null
  && 'gameState' in value
  && 'drawMode' in value
  && (value.drawMode === 'one' || value.drawMode === 'three')
  && isSolitaireState(value.gameState)

export const loadSolitaireSave = async (): Promise<ActiveSaveLoadResult<SolitaireSaveState>> => {
  const result = await loadActiveSave<SolitaireSaveState>('solitaire', isSolitaireSaveState)
  if (result.status !== 'loaded') return result
  const save = result.save
  if (isWin(save.state.gameState)) {
    const recorded = await recordGameCompleted('solitaire', save.sessionId, save.state.gameState.history.length)
    if (!recorded) return result
    if (recorded) await deleteActiveSave('solitaire')
    return { status: 'none' }
  }
  if (isResumableSolitaireState(save.state.gameState)) return result
  await deleteActiveSave('solitaire')
  return { status: 'rejected' }
}

export const hasResumableSolitaireSave = async (): Promise<ContinueAvailability> => {
  const result: ActiveSaveLoadResult<SolitaireSaveState> = await loadSolitaireSave()
  if (result.status !== 'loaded') return result.status
  return isWin(result.save.state.gameState) ? 'none' : 'available'
}
