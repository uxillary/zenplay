import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createAppHistoryState, readAppNavigation, type AppNavigation } from './navigation.ts'
import { FLAGS_GAME } from '../games/flags/game.ts'

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

test('Flags is available in the shared game registry and accepted by history navigation', () => {
  assert.equal(FLAGS_GAME.name, 'Flags')
  assert.deepEqual(readAppNavigation({ zenplayNavigation: { screen: 'game', gameId: 'flags' } }, new Set([...gameIds, FLAGS_GAME.id])), { screen: 'game', gameId: 'flags' })
})

test('game screens are loaded on demand with an accessible pending status', () => {
  const source = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8')
  for (const modulePath of [
    '../games/solitaire/ui/SolitaireScreen',
    '../games/sudoku/ui/SudokuScreen',
    '../games/pairs/ui/PairsScreen',
    '../games/wordSearch/ui/WordSearchScreen',
    '../games/noughtsCrosses/ui/NoughtsCrossesScreen',
    '../games/fifteen/ui/FifteenScreen',
    '../games/mahjong/ui/MahjongScreen',
    '../games/flags/ui/FlagsScreen',
  ]) {
    assert.ok(source.includes(`lazy(() => import('${modulePath}')`), `${modulePath} should be dynamically imported`)
  }
  assert.doesNotMatch(source, /^import\s+\{[^}]+\}\s+from\s+'\.\.\/games\//m)
  assert.match(source, /<Suspense fallback=\{<p[^>]*role="status" aria-live="polite">Loading game…<\/p>\}>/)
  assert.match(source, /class GameScreenErrorBoundary extends Component/)
  assert.match(source, /role="alert"[\s\S]*Reload ZenPlay/)
})
