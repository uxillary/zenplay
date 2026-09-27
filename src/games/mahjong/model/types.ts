export type MahjongFamily = 'characters' | 'bamboo' | 'dots' | 'winds' | 'dragons' | 'flowers' | 'seasons'

export type MahjongTile = {
  id: string
  family: MahjongFamily
  value: number | string
  matchKey: string
  x: number
  y: number
  z: number
  removed: boolean
}

export type MahjongState = {
  tiles: MahjongTile[]
  removedPairs: [string, string][]
  moves: number
  accessibleLabels: boolean
}
