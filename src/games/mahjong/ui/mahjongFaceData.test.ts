import test from 'node:test'
import assert from 'node:assert/strict'
import type { MahjongTile } from '../model/types.ts'
import { getMahjongAccessibleName, getMahjongBambooPositions, getMahjongCirclePips, getMahjongFullCaption, getMahjongTileCaption } from './mahjongFaceData.ts'

const tile = (family: MahjongTile['family'], value: MahjongTile['value']): MahjongTile => ({
  id: `${family}-${value}`, family, value, matchKey: `${family}-${value}`, x: 0, y: 0, z: 0, removed: false,
})

test('circle and bamboo artwork layouts contain the correct number of suit marks', () => {
  for (let value = 1; value <= 9; value += 1) {
    assert.equal(getMahjongCirclePips(value).length, value)
    if (value > 1) assert.equal(getMahjongBambooPositions(value).length, value)
  }
  assert.equal(getMahjongBambooPositions(1).length, 0) // One Bamboo uses its distinct bird emblem.
})

test('English tile names remain descriptive for every family', () => {
  assert.equal(getMahjongAccessibleName(tile('dots', 1)), 'One Circle')
  assert.equal(getMahjongAccessibleName(tile('characters', 1)), 'One Character')
  assert.equal(getMahjongAccessibleName(tile('dots', 5)), 'Five Circles')
  assert.equal(getMahjongAccessibleName(tile('bamboo', 7)), 'Seven Bamboo')
  assert.equal(getMahjongAccessibleName(tile('characters', 3)), 'Three Characters')
  assert.equal(getMahjongAccessibleName(tile('winds', 'east')), 'East Wind')
  assert.equal(getMahjongAccessibleName(tile('dragons', 'red')), 'Red Dragon')
  assert.equal(getMahjongAccessibleName(tile('flowers', 'plum')), 'Plum Flower')
  assert.equal(getMahjongAccessibleName(tile('seasons', 'summer')), 'Summer Season')
})

test('Tile Labels show secondary English captions only when enabled', () => {
  const circles = tile('dots', 5)
  assert.equal(getMahjongTileCaption(circles, false), null)
  assert.equal(getMahjongTileCaption(circles, true), '5 Circles')
  assert.equal(getMahjongTileCaption(circles, true, true), '5O')
  assert.equal(getMahjongFullCaption(tile('dots', 1)), '1 Circle')
  assert.equal(getMahjongTileCaption(tile('seasons', 'summer'), true), 'Summer')
  assert.equal(getMahjongTileCaption(tile('seasons', 'summer'), true, true), 'Su')
})
