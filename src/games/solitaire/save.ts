import { deleteActiveSave, loadActiveSave } from '../../persistence/gameSave.ts'
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

export const loadSolitaireSave = async () => {
  const save = await loadActiveSave<SolitaireSaveState>('solitaire', isSolitaireSaveState)
  if (!save) return null
  if (isWin(save.state.gameState)) {
    const recorded = await recordGameCompleted('solitaire', save.sessionId, save.state.gameState.history.length)
    if (!recorded) return save
    if (recorded) await deleteActiveSave('solitaire')
    return null
  }
  return isResumableSolitaireState(save.state.gameState) ? save : null
}

export const hasResumableSolitaireSave = async (): Promise<boolean> => {
  const save = await loadSolitaireSave()
  return save !== null && !isWin(save.state.gameState)
}
