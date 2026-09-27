import { PAIR_FACES, type PairCard } from '../model/types.ts'

const faceName = (id: PairCard['pairId']): string => PAIR_FACES.find(({ id: faceId }) => faceId === id)?.label ?? 'symbol'

export const describePairsCard = (index: number, card: PairCard, revealed: boolean, matched: boolean, hinted: boolean): string =>
  `Card ${index + 1}, ${revealed ? `${faceName(card.pairId)}${matched ? ', matched' : hinted ? ', shown by hint' : ''}` : 'hidden'}.`
