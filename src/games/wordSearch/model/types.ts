export type WordSearchCell = { row: number; column: number }
export type WordSearchWord = { word: string; cells: WordSearchCell[] }
export type WordSearchPuzzle = {
  id: string
  theme: string
  grid: string[][]
  words: WordSearchWord[]
}
export type WordSearchState = { puzzleId: string; foundWords: string[] }

