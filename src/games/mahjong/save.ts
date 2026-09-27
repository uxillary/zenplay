import { loadActiveSave } from '../../persistence/gameSave.ts'
import { isMahjongState } from './model/persistence.ts'
import type { MahjongState } from './model/types.ts'

export const loadMahjongSave = () => loadActiveSave<MahjongState>('mahjong', isMahjongState)
export const hasResumableMahjongSave = async (): Promise<boolean> => {
  const save = await loadMahjongSave()
  return Boolean(save && save.state.tiles.some((tile) => !tile.removed))
}
