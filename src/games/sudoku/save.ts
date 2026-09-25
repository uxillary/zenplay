import { deleteActiveSave, loadActiveSave } from '../../persistence/gameSave.ts'
import { recordGameCompleted } from '../../persistence/statistics.ts'
import { findSudokuPuzzle } from './model/puzzles.ts'
import { isSudokuComplete } from './model/rules.ts'
import { isSudokuState } from './model/persistence.ts'
import type { SudokuState } from './model/types.ts'

export const loadSudokuSave = async () => {
  const save = await loadActiveSave<SudokuState>('sudoku', isSudokuState)
  if (!save) return null
  const puzzle = findSudokuPuzzle(save.state.puzzleId)
  if (puzzle && isSudokuComplete(save.state, puzzle)) {
    const recorded = await recordGameCompleted('sudoku', save.sessionId, save.state.history.length, undefined, save.state.difficulty)
    if (!recorded) return save
    await deleteActiveSave('sudoku')
    return null
  }
  return save
}

export const hasResumableSudokuSave = async (): Promise<boolean> => {
  const save = await loadSudokuSave()
  if (!save) return false
  const puzzle = findSudokuPuzzle(save.state.puzzleId)
  return Boolean(puzzle && !isSudokuComplete(save.state, puzzle))
}
