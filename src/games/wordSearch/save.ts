import { loadActiveSave } from '../../persistence/gameSave.ts'
import { isWordSearchState } from './model/persistence.ts'
import type { WordSearchState } from './model/types.ts'

export const loadWordSearchSave = () => loadActiveSave<WordSearchState>('word-search', isWordSearchState)
export const hasResumableWordSearchSave = async (): Promise<boolean> => Boolean(await loadWordSearchSave())

