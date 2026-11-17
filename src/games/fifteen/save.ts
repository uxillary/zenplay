import { waitForGameWrites } from '../../persistence/pendingWrites.ts'
import { loadActiveSave, type ActiveSaveLoadResult, type ContinueAvailability } from '../../persistence/gameSave.ts'
import { isFifteenState } from './model/persistence.ts'
import { isFifteenSolved } from './model/engine.ts'
import type { FifteenState } from './model/types.ts'

export const loadFifteenSave = async (): Promise<ActiveSaveLoadResult<FifteenState>> => {
  await waitForGameWrites('fifteen')
  return loadActiveSave<FifteenState>('fifteen', isFifteenState)
}
export const hasResumableFifteenSave = async (): Promise<ContinueAvailability> => {
  const result: ActiveSaveLoadResult<FifteenState> = await loadFifteenSave()
  if (result.status !== 'loaded') return result.status
  return isFifteenSolved(result.save.state) ? 'none' : 'available'
}
