import type { WordSearchCell, WordSearchPuzzle, WordSearchWord } from './types.ts'

const SIZE = 8
const themes = [
  { theme: 'Animals', words: ['RABBIT', 'TIGER', 'HORSE', 'MOUSE', 'SHEEP', 'DUCK'] },
  { theme: 'Garden', words: ['FLOWER', 'GARDEN', 'SEED', 'GRASS', 'ROSE', 'SPADE'] },
  { theme: 'Food', words: ['BREAD', 'APPLE', 'CHEESE', 'PASTA', 'PEAR', 'CAKE'] },
  { theme: 'Seaside', words: ['BEACH', 'SHELL', 'WAVES', 'BOAT', 'SAND', 'FISH'] },
  { theme: 'Home', words: ['KITCHEN', 'WINDOW', 'CHAIR', 'TABLE', 'DOOR', 'LAMP'] },
  { theme: 'Nature', words: ['FOREST', 'RIVER', 'CLOUD', 'TREE', 'STONE', 'LEAF'] },
] as const
const directions = [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]] as const

const seededRandom = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 0x100000000
}

export const createBundledWordSearchPuzzle = (themeIndex: number, variant: number): WordSearchPuzzle => {
  const source = themes[themeIndex]
  const random = seededRandom((themeIndex + 1) * 100 + variant)
  const grid = Array.from({ length: SIZE }, () => Array<string>(SIZE).fill(''))
  const placements: WordSearchWord[] = []
  const words = [...source.words].sort((a, b) => b.length - a.length || a.localeCompare(b))
  for (const word of words) {
    const options: { cells: WordSearchCell[]; direction: readonly [number, number] }[] = []
    for (const [dr, dc] of directions) for (let row = 0; row < SIZE; row++) for (let column = 0; column < SIZE; column++) {
      const endRow = row + (word.length - 1) * dr
      const endColumn = column + (word.length - 1) * dc
      if (endRow < 0 || endRow >= SIZE || endColumn < 0 || endColumn >= SIZE) continue
      options.push({ direction: [dr, dc], cells: [...word].map((_, index) => ({ row: row + index * dr, column: column + index * dc })) })
    }
    for (let index = options.length - 1; index > 0; index--) {
      const other = Math.floor(random() * (index + 1))
      ;[options[index], options[other]] = [options[other], options[index]]
    }
    const selected = options.find(({ cells }) => cells.every((cell, index) => !grid[cell.row][cell.column] || grid[cell.row][cell.column] === word[index]))
    if (!selected) throw new Error(`Could not place ${word} in ${source.theme}`)
    selected.cells.forEach((cell, index) => { grid[cell.row][cell.column] = word[index] })
    placements.push({ word, cells: selected.cells })
  }
  for (let row = 0; row < SIZE; row++) for (let column = 0; column < SIZE; column++) {
    if (!grid[row][column]) grid[row][column] = String.fromCharCode(65 + Math.floor(random() * 26))
  }
  return { id: `${source.theme.toLowerCase()}-${variant}`, theme: source.theme, grid, words: placements }
}

export const WORD_SEARCH_PUZZLES: readonly WordSearchPuzzle[] = themes.flatMap((_, themeIndex) => [createBundledWordSearchPuzzle(themeIndex, 1), createBundledWordSearchPuzzle(themeIndex, 2)])
export const findWordSearchPuzzle = (id: string): WordSearchPuzzle | undefined => WORD_SEARCH_PUZZLES.find((puzzle) => puzzle.id === id)

export const validateWordSearchPuzzle = (puzzle: unknown): puzzle is WordSearchPuzzle => {
  if (!puzzle || typeof puzzle !== 'object') return false
  const value = puzzle as Record<string, unknown>
  if (typeof value.id !== 'string' || typeof value.theme !== 'string' || !Array.isArray(value.grid) || value.grid.length !== SIZE) return false
  const grid = value.grid as unknown[][]
  if (!grid.every((row) => Array.isArray(row) && row.length === SIZE && row.every((letter) => typeof letter === 'string' && /^[A-Z]$/.test(letter)))) return false
  if (!Array.isArray(value.words) || value.words.length === 0) return false
  const seen = new Set<string>()
  return value.words.every((item) => {
    if (!item || typeof item !== 'object') return false
    const entry = item as Record<string, unknown>
    if (typeof entry.word !== 'string' || !/^[A-Z]{2,8}$/.test(entry.word) || seen.has(entry.word) || !Array.isArray(entry.cells) || entry.cells.length !== entry.word.length) return false
    const word = entry.word
    seen.add(word)
    const cells = entry.cells as WordSearchCell[]
    if (!cells.every((cell) => cell && Number.isInteger(cell.row) && Number.isInteger(cell.column) && cell.row >= 0 && cell.row < SIZE && cell.column >= 0 && cell.column < SIZE)) return false
    const dr = cells[1].row - cells[0].row
    const dc = cells[1].column - cells[0].column
    if ((![-1, 0, 1].includes(dr) || ![-1, 0, 1].includes(dc)) || (dr === 0 && dc === 0)) return false
    return cells.every((cell, index) => cell.row === cells[0].row + index * dr && cell.column === cells[0].column + index * dc && grid[cell.row][cell.column] === word[index])
  })
}

