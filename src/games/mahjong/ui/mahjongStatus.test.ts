import test from 'node:test'
import assert from 'node:assert/strict'
import { getMahjongPairCountLabel } from './mahjongStatus.ts'

test('Mahjong matched-pair count uses clear singular and plural wording', () => {
  assert.equal(getMahjongPairCountLabel(0), '0 pairs matched')
  assert.equal(getMahjongPairCountLabel(1), '1 pair matched')
  assert.equal(getMahjongPairCountLabel(2), '2 pairs matched')
})
