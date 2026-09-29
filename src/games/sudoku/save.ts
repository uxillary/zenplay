import { deleteActiveSave, loadActiveSave, type ActiveSaveLoadResult, type ContinueAvailability } from '../../persistence/gameSave.ts'
import { recordGameCompleted } from '../../persistence/statistics.ts'
import { findSudokuPuzzle } from './model/puzzles.ts'
import { isSudokuComplete } from './model/rules.ts'
import { isSudokuState } from './model/persistence.ts'
import type { SudokuState } from './model/types.ts'

export const loadSudokuSave = async (): Promise<ActiveSaveLoadResult<SudokuState>> => {
  const result = await loadActiveSave<SudokuState>('sudoku', isSudokuState)
  if (result.status !== 'loaded') return result
  const save = result.save
  const puzzle = findSudokuPuzzle(save.state.puzzleId)
  if (puzzle && isSudokuComplete(save.state, puzzle)) {
    const recorded = await recordGameCompleted('sudoku', save.sessionId, save.state.history.length, undefined, save.state.difficulty)
    if (!recorded) return result
    await deleteActiveSave('sudoku')
    return { status: 'none' }
  }
  if (!puzzle) {
    await deleteActiveSave('sudoku')
    return { status: 'rejected' }
  }
  return result
}

export const hasResumableSudokuSave = async (): Promise<ContinueAvailability> => {
  const result: ActiveSaveLoadResult<SudokuState> = await loadSudokuSave()
  if (result.status !== 'loaded') return result.status
  const puzzle = findSudokuPuzzle(result.save.state.puzzleId)
  return puzzle && !isSudokuComplete(result.save.state, puzzle) ? 'available' : 'none'
}
