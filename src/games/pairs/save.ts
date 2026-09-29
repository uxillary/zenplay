import { deleteActiveSave, loadActiveSave, type ActiveSaveLoadResult, type ContinueAvailability } from '../../persistence/gameSave.ts'
import { recordGameCompleted } from '../../persistence/statistics.ts'
import { isPairsComplete } from './model/engine.ts'
import { isPairsState } from './model/persistence.ts'
import type { PairsState } from './model/types.ts'

export const loadPairsSave = async (): Promise<ActiveSaveLoadResult<PairsState>> => {
  const result = await loadActiveSave<PairsState>('pairs', isPairsState)
  if (result.status !== 'loaded') return result
  const save = result.save
  if (isPairsComplete(save.state)) {
    const recorded = await recordGameCompleted('pairs', save.sessionId, save.state.turns, undefined, save.state.boardSize)
    if (!recorded) return result
    await deleteActiveSave('pairs')
    return { status: 'none' }
  }
  return result
}

export const hasResumablePairsSave = async (): Promise<ContinueAvailability> => {
  const result: ActiveSaveLoadResult<PairsState> = await loadPairsSave()
  if (result.status !== 'loaded') return result.status
  return isPairsComplete(result.save.state) ? 'none' : 'available'
}
