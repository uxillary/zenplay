import { loadActiveSave } from '../../persistence/gameSave.ts'
import { isFifteenState } from './model/persistence.ts'
import { isFifteenSolved } from './model/engine.ts'
import type { FifteenState } from './model/types.ts'

export const loadFifteenSave = () => loadActiveSave<FifteenState>('fifteen', isFifteenState)
export const hasResumableFifteenSave = async (): Promise<boolean> => {
  const save = await loadFifteenSave()
  return Boolean(save && !isFifteenSolved(save.state))
}
