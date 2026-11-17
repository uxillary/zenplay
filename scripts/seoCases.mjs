// Acceptance expectations, deliberately independent of the implementation's catalogue.
export const gameCases = [
  { id: 'solitaire', heading: 'Solitaire', selector: '.zen-solitaire-table', resume: true },
  { id: 'sudoku', heading: 'Sudoku', selector: '.sudoku-board', resume: true },
  { id: 'pairs', heading: 'Pairs', selector: '.pairs-grid', resume: true },
  { id: 'word-search', heading: 'Word Search', selector: '.word-search-grid', resume: true },
  { id: 'noughts-crosses', heading: 'Noughts & Crosses', selector: '.noughts-board', resume: false },
  { id: 'fifteen', heading: 'Fifteen Puzzle', selector: '.fifteen-board button[aria-disabled="false"]', resume: true },
  { id: 'mahjong', heading: 'Mahjong Solitaire', selector: '.mahjong-board', resume: true },
  { id: 'flags', heading: 'Flags Quiz', selector: '.flags-setup', resume: false },
].map(game => ({ ...game, path: `/games/${game.id}/` }))

export const utilityCases = [
  { path: '/settings/', heading: 'Settings' }, { path: '/profile/', heading: 'Profile' },
  { path: '/support/', heading: 'Support ZenPlay' }, { path: '/install/', heading: 'Install ZenPlay' },
]

export const pageCases = [{ path: '/', heading: 'Choose a game' }, ...gameCases, ...utilityCases]
