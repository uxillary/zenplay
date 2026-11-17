import { FLAGS_GAME } from '../games/flags/game.ts'

// Public, deterministic game information. Keep persistence and browser imports out.
export type GameId = 'solitaire' | 'sudoku' | 'pairs' | 'word-search' | 'noughts-crosses' | 'fifteen' | 'mahjong' | 'flags'

export type GameSummary = {
  id: GameId
  name: string
  description: string
  status: 'available' | 'coming-soon'
  target: `/games/${GameId}/`
  supportsContinue?: boolean
}

export const gameCatalogue: readonly GameSummary[] = [
  { id: 'solitaire', name: 'Solitaire', description: 'A familiar game of patience with a standard deck of cards.', status: 'available', target: '/games/solitaire/', supportsContinue: true },
  { id: 'sudoku', name: 'Sudoku', description: 'A familiar number puzzle with clear, readable controls.', status: 'available', target: '/games/sudoku/', supportsContinue: true },
  { id: 'pairs', name: 'Pairs', description: 'Find the matching cards by turning over two at a time.', status: 'available', target: '/games/pairs/', supportsContinue: true },
  { id: 'word-search', name: 'Word Search', description: 'Find familiar words hidden in a letter grid.', status: 'available', target: '/games/word-search/', supportsContinue: true },
  { id: 'noughts-crosses', name: 'Noughts & Crosses', description: 'Take turns placing noughts and crosses in a familiar 3 × 3 grid.', status: 'available', target: '/games/noughts-crosses/' },
  { id: 'fifteen', name: 'Fifteen Puzzle', description: 'Slide numbered tiles into the empty space to put them in order.', status: 'available', target: '/games/fifteen/', supportsContinue: true },
  { id: 'mahjong', name: 'Mahjong', description: 'Match free tiles and clear the board.', status: 'available', target: '/games/mahjong/', supportsContinue: true },
  { ...FLAGS_GAME, status: 'available', target: '/games/flags/' },
]
