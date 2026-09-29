export const getMahjongPairCountLabel = (count: number): string =>
  `${count} ${count === 1 ? 'pair' : 'pairs'} matched`
