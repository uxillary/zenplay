import { loadActiveSave, type ActiveSaveLoadResult, type ContinueAvailability } from '../../persistence/gameSave.ts'
import { isMahjongState } from './model/persistence.ts'
import type { MahjongState } from './model/types.ts'

export const loadMahjongSave = (): Promise<ActiveSaveLoadResult<MahjongState>> => loadActiveSave<MahjongState>('mahjong', isMahjongState)
export const hasResumableMahjongSave = async (): Promise<ContinueAvailability> => {
  const result: ActiveSaveLoadResult<MahjongState> = await loadMahjongSave()
  if (result.status !== 'loaded') return result.status
  return result.save.state.tiles.some((tile) => !tile.removed) ? 'available' : 'none'
}
