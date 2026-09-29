import { loadActiveSave, type ActiveSaveLoadResult, type ContinueAvailability } from '../../persistence/gameSave.ts'
import { isWordSearchState } from './model/persistence.ts'
import type { WordSearchState } from './model/types.ts'

export const loadWordSearchSave = (): Promise<ActiveSaveLoadResult<WordSearchState>> => loadActiveSave<WordSearchState>('word-search', isWordSearchState)
export const hasResumableWordSearchSave = async (): Promise<ContinueAvailability> => {
  const result: ActiveSaveLoadResult<WordSearchState> = await loadWordSearchSave()
  if (result.status !== 'loaded') return result.status
  return 'available'
}

