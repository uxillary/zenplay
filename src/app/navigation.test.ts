import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { appPathForNavigation, createAppHistoryState, homeNavigation, notFoundNavigation, parseAppPath, readAppNavigation, resolveAppNavigation, shouldHandleLinkClick, solitaireNavigation, type AppNavigation } from './navigation.ts'
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
    zenplayNavigationVersion: 1,
  })
})

test('public paths round-trip and aliases resolve without accepting unknown games', () => {
  for (const navigation of [homeNavigation, solitaireNavigation]) {
    assert.deepEqual(parseAppPath(appPathForNavigation(navigation)), navigation)
  }
  for (const path of ['/games/solitaire', '/games/solitaire/', '/games/solitaire/index.html']) {
    assert.deepEqual(parseAppPath(path), solitaireNavigation)
  }
  for (const path of ['/games/missing/', '/games/sudoku/', '/games/Solitaire/', '/games/%73olitaire/', '//games/solitaire/', '/games/solitaire/extra', '/games/solitaire/?game=sudoku']) {
    assert.equal(parseAppPath(path), null, path)
  }
})

test('direct Solitaire entry and explicit paths override contradictory legacy state', () => {
  assert.deepEqual(resolveAppNavigation('/games/solitaire/', null, gameIds), solitaireNavigation)
  assert.deepEqual(resolveAppNavigation('/games/solitaire/', { zenplayNavigation: { screen: 'profile' } }, gameIds), solitaireNavigation)
  assert.deepEqual(resolveAppNavigation('/missing/', createAppHistoryState(null, solitaireNavigation), gameIds), notFoundNavigation)
})

test('legacy root Solitaire entries upgrade once and fresh Home stays Home', () => {
  const legacy = { otherFeature: 4, zenplayNavigation: solitaireNavigation }
  const restored = resolveAppNavigation('/', legacy, gameIds)
  assert.deepEqual(restored, solitaireNavigation)
  const upgraded = createAppHistoryState(legacy, restored)
  assert.equal(upgraded.otherFeature, 4)
  assert.deepEqual(resolveAppNavigation(appPathForNavigation(restored), upgraded, gameIds), solitaireNavigation)
  assert.deepEqual(resolveAppNavigation('/', upgraded, gameIds), homeNavigation)
  assert.deepEqual(resolveAppNavigation('/', { zenplayNavigation: { screen: 'game', gameId: 'missing' } }, gameIds), homeNavigation)
  assert.deepEqual(resolveAppNavigation('/', null, gameIds), homeNavigation)
})

test('unsliced games and utilities retain their existing root-history behavior', () => {
  for (const navigation of [{ screen: 'game', gameId: 'mahjong' }, { screen: 'settings', gameId: null }, { screen: 'profile', gameId: null }] as const) {
    const state = createAppHistoryState(null, navigation)
    assert.equal(appPathForNavigation(navigation), '/')
    assert.deepEqual(resolveAppNavigation('/', state, gameIds), navigation)
  }
})

test('progressive links handle only unmodified primary clicks', () => {
  const click = { defaultPrevented: false, button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }
  assert.equal(shouldHandleLinkClick(click), true)
  for (const modifier of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey', 'defaultPrevented']) {
    assert.equal(shouldHandleLinkClick({ ...click, [modifier]: true }), false, modifier)
  }
  assert.equal(shouldHandleLinkClick({ ...click, button: 1 }), false)
  assert.equal(shouldHandleLinkClick({ ...click, button: 2 }), false)
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
