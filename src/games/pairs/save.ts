import { deleteActiveSave, loadActiveSave } from '../../persistence/gameSave.ts'
import { recordGameCompleted } from '../../persistence/statistics.ts'
import { isPairsComplete } from './model/engine.ts'
import { isPairsState } from './model/persistence.ts'
import type { PairsState } from './model/types.ts'

export const loadPairsSave = async () => {
  const save = await loadActiveSave<PairsState>('pairs', isPairsState)
  if (!save) return null
  if (isPairsComplete(save.state)) {
    const recorded = await recordGameCompleted('pairs', save.sessionId, save.state.turns, undefined, save.state.boardSize)
    if (!recorded) return save
    await deleteActiveSave('pairs')
    return null
  }
  return save
}

export const hasResumablePairsSave = async (): Promise<boolean> => {
  const save = await loadPairsSave()
  return Boolean(save && !isPairsComplete(save.state))
}
