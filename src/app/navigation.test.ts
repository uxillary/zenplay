import assert from 'node:assert/strict'
import test from 'node:test'
import { createAppHistoryState, readAppNavigation, type AppNavigation } from './navigation.ts'

const gameIds = new Set(['solitaire', 'mahjong'])

test('reads only valid ZenPlay history screens and known games', () => {
  assert.deepEqual(readAppNavigation({ zenplayNavigation: { screen: 'home' } }, gameIds), { screen: 'home', gameId: null })
  assert.deepEqual(readAppNavigation({ zenplayNavigation: { screen: 'profile' } }, gameIds), { screen: 'profile', gameId: null })
  assert.deepEqual(readAppNavigation({ zenplayNavigation: { screen: 'support' } }, gameIds), { screen: 'support', gameId: null })
  assert.deepEqual(readAppNavigation({ zenplayNavigation: { screen: 'game', gameId: 'solitaire' } }, gameIds), { screen: 'game', gameId: 'solitaire' })
  assert.equal(readAppNavigation(null, gameIds), null)
  assert.equal(readAppNavigation({ zenplayNavigation: { screen: 'game', gameId: 'missing' } }, gameIds), null)
  assert.equal(readAppNavigation({ zenplayNavigation: { screen: 'unknown' } }, gameIds), null)
})

test('adds ZenPlay navigation without discarding other history state', () => {
  const navigation: AppNavigation = { screen: 'settings', gameId: null }
  assert.deepEqual(createAppHistoryState({ otherFeature: 4 }, navigation), {
    otherFeature: 4,
    zenplayNavigation: navigation,
  })
})
