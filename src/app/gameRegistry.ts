import { gameCatalogue, type GameSummary, type GameId } from './gameCatalogue'
import { hasResumableSolitaireSave } from '../games/solitaire/save'
import { hasResumableSudokuSave } from '../games/sudoku/save'
import { hasResumablePairsSave } from '../games/pairs/save'
import { hasResumableWordSearchSave } from '../games/wordSearch/save'
import { hasResumableFifteenSave } from '../games/fifteen/save'
import { hasResumableMahjongSave } from '../games/mahjong/save'
import type { ContinueAvailability } from '../persistence/gameSave'

export type { GameId } from './gameCatalogue'
export type GameDefinition = GameSummary & { getContinueAvailability?: () => Promise<ContinueAvailability> }

const continueLoaders: Partial<Record<GameId, () => Promise<ContinueAvailability>>> = {
  solitaire: hasResumableSolitaireSave,
  sudoku: hasResumableSudokuSave,
  pairs: hasResumablePairsSave,
  'word-search': hasResumableWordSearchSave,
  fifteen: hasResumableFifteenSave,
  mahjong: hasResumableMahjongSave,
}

export const games: readonly GameDefinition[] = gameCatalogue.map((game) => ({
  ...game,
  getContinueAvailability: continueLoaders[game.id],
}))
