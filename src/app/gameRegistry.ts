import { hasResumableSolitaireSave } from '../games/solitaire/save'
import { hasResumableSudokuSave } from '../games/sudoku/save'
import { hasResumablePairsSave } from '../games/pairs/save'
import { hasResumableWordSearchSave } from '../games/wordSearch/save'
import { hasResumableFifteenSave } from '../games/fifteen/save'

export type GameId = 'solitaire' | 'sudoku' | 'pairs' | 'word-search' | 'noughts-crosses' | 'fifteen'

export type GameDefinition = {
  id: GameId
  name: string
  description: string
  status: 'available' | 'coming-soon'
  target: `/${string}`
  supportsContinue?: boolean
  getContinueAvailability?: () => Promise<boolean>
}

export const games: readonly GameDefinition[] = [
  {
    id: 'solitaire',
    name: 'Solitaire',
    description: 'A familiar game of patience with a standard deck of cards.',
    status: 'available',
    target: '/games/solitaire',
    supportsContinue: true,
    getContinueAvailability: hasResumableSolitaireSave,
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    description: 'A familiar number puzzle with clear, readable controls.',
    status: 'available',
    target: '/games/sudoku',
    supportsContinue: true,
    getContinueAvailability: hasResumableSudokuSave,
  },
  {
    id: 'pairs',
    name: 'Pairs',
    description: 'Find the matching cards by turning over two at a time.',
    status: 'available',
    target: '/games/pairs',
    supportsContinue: true,
    getContinueAvailability: hasResumablePairsSave,
  },
  {
    id: 'word-search',
    name: 'Word Search',
    description: 'Find familiar words hidden in a letter grid.',
    status: 'available',
    target: '/games/word-search',
    supportsContinue: true,
    getContinueAvailability: hasResumableWordSearchSave,
  },
  {
    id: 'noughts-crosses',
    name: 'Noughts & Crosses',
    description: 'Take turns placing noughts and crosses in a familiar 3 × 3 grid.',
    status: 'available',
    target: '/games/noughts-crosses',
  },
  {
    id: 'fifteen',
    name: 'Fifteen Puzzle',
    description: 'Slide numbered tiles into the empty space to put them in order.',
    status: 'available',
    target: '/games/fifteen',
    supportsContinue: true,
    getContinueAvailability: hasResumableFifteenSave,
  },
]
