import type { MahjongTile } from '../model/types.ts'

const numberWords = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
const points: Record<number, readonly [number, number][]> = {
  1: [[50, 56]],
  2: [[50, 34], [50, 76]],
  3: [[31, 32], [50, 54], [69, 76]],
  4: [[34, 34], [66, 34], [34, 76], [66, 76]],
  5: [[34, 34], [66, 34], [50, 55], [34, 76], [66, 76]],
  6: [[34, 27], [66, 27], [34, 51], [66, 51], [34, 75], [66, 75]],
  7: [[34, 25], [66, 25], [34, 50], [66, 50], [34, 75], [66, 75], [50, 88]],
  8: [[34, 19], [66, 19], [34, 40], [66, 40], [34, 61], [66, 61], [34, 82], [66, 82]],
  9: [[25, 25], [50, 25], [75, 25], [25, 50], [50, 50], [75, 50], [25, 75], [50, 75], [75, 75]],
}
const bambooPoints: Record<number, readonly [number, number][]> = {
  2: [[36, 50], [64, 70]],
  3: [[50, 27], [34, 68], [66, 78]],
  4: [[34, 34], [66, 34], [34, 76], [66, 76]],
  5: [[34, 34], [66, 34], [50, 55], [34, 76], [66, 76]],
  6: [[34, 27], [66, 27], [34, 51], [66, 51], [34, 75], [66, 75]],
  7: [[34, 25], [66, 25], [34, 50], [66, 50], [34, 75], [66, 75], [50, 88]],
  8: [[34, 19], [66, 19], [34, 40], [66, 40], [34, 61], [66, 61], [34, 82], [66, 82]],
  9: [[25, 25], [50, 25], [75, 25], [25, 50], [50, 50], [75, 50], [25, 75], [50, 75], [75, 75]],
}

const valueWord = (value: number | string) => typeof value === 'number' && value >= 1 && value <= 9 ? numberWords[value - 1] : String(value)
export const getMahjongCirclePips = (value: number): readonly [number, number][] => points[value] ?? []
export const getMahjongBambooPositions = (value: number): readonly [number, number][] => bambooPoints[value] ?? []

export const getMahjongAccessibleName = (tile: MahjongTile) => {
  if (tile.family === 'characters') return `${valueWord(tile.value)} ${Number(tile.value) === 1 ? 'Character' : 'Characters'}`
  if (tile.family === 'bamboo') return `${valueWord(tile.value)} Bamboo`
  if (tile.family === 'dots') return `${valueWord(tile.value)} ${Number(tile.value) === 1 ? 'Circle' : 'Circles'}`
  if (tile.family === 'winds') return `${String(tile.value).charAt(0).toUpperCase()}${String(tile.value).slice(1)} Wind`
  if (tile.family === 'dragons') return `${String(tile.value).charAt(0).toUpperCase()}${String(tile.value).slice(1)} Dragon`
  return `${String(tile.value).charAt(0).toUpperCase()}${String(tile.value).slice(1)} ${tile.family === 'flowers' ? 'Flower' : 'Season'}`
}

export const getMahjongFullCaption = (tile: MahjongTile) => {
  if (tile.family === 'characters') return `${tile.value} ${Number(tile.value) === 1 ? 'Character' : 'Characters'}`
  if (tile.family === 'bamboo') return `${tile.value} Bamboo`
  if (tile.family === 'dots') return `${tile.value} ${Number(tile.value) === 1 ? 'Circle' : 'Circles'}`
  if (tile.family === 'winds') return getMahjongAccessibleName(tile).replace(' Wind', '')
  if (tile.family === 'dragons') return getMahjongAccessibleName(tile).replace(' Dragon', '')
  return String(tile.value).charAt(0).toUpperCase() + String(tile.value).slice(1)
}

export const getMahjongCompactCaption = (tile: MahjongTile) => {
  if (tile.family === 'characters') return `${tile.value}C`
  if (tile.family === 'bamboo') return `${tile.value}B`
  if (tile.family === 'dots') return `${tile.value}O`
  if (tile.family === 'winds') return ({ east: 'E', south: 'S', west: 'W', north: 'N' } as Record<string, string>)[String(tile.value)]
  if (tile.family === 'dragons') return ({ red: 'R', green: 'G', white: 'Wh' } as Record<string, string>)[String(tile.value)]
  if (tile.family === 'flowers') return ({ plum: 'Pl', orchid: 'Or', chrysanthemum: 'Ch', bamboo: 'Ba' } as Record<string, string>)[String(tile.value)]
  return ({ spring: 'Sp', summer: 'Su', autumn: 'Au', winter: 'Wi' } as Record<string, string>)[String(tile.value)]
}

export const getMahjongTileCaption = (tile: MahjongTile, enabled: boolean, compact = false) =>
  enabled ? compact ? getMahjongCompactCaption(tile) : getMahjongFullCaption(tile) : null
