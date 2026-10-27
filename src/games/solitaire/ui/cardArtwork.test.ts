import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { foundationGuideSuits, courtCardAsset, numberedPips, suitPaths } from './cardArtwork.ts'
import type { Card, Suit } from '../model/types.ts'

const card = (rank: Card['rank'], suit: Suit): Card => ({ id: `${rank}-${suit}`, rank, suit, faceUp: true })

test('numbered faces use one pip system with traditional counts and room for corner indices', () => {
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const
  for (const [index, rank] of ranks.entries()) {
    const pips = numberedPips[rank]
    assert.equal(pips.length, index + 1)
    for (const pip of pips) {
      const radius = (pip.size ?? 64) / 2
      assert.ok(pip.x - radius >= 70 && pip.x + radius <= 290)
      assert.ok(pip.y - radius >= 70 && pip.y + radius <= 470)
    }
  }
  assert.equal(numberedPips['2'][1].inverted, true)
  assert.equal(numberedPips['10'].filter((pip) => pip.inverted).length, 5)
  assert.equal(new Set(Object.values(suitPaths)).size, 4)
  assert.equal((suitPaths.clubs.match(/[Mm]/g) ?? []).length, 1, 'club must use one filled silhouette')
})

test('only authentic court ranks map to the retained English-pattern assets', () => {
  assert.equal(courtCardAsset(card('Q', 'hearts')), '/cards/english-pattern/queen_of_hearts.svg')
  assert.equal(courtCardAsset(card('J', 'clubs')), '/cards/english-pattern/jack_of_clubs.svg')
  assert.equal(courtCardAsset(card('K', 'spades')), '/cards/english-pattern/king_of_spades.svg')
  assert.equal(courtCardAsset(card('10', 'diamonds')), null)
  assert.equal(courtCardAsset(card('A', 'spades')), null)
})

test('empty foundation guides follow missing suits without binding an Ace to a slot', () => {
  assert.deepEqual(foundationGuideSuits([[], [], [], []]), ['clubs', 'diamonds', 'hearts', 'spades'])
  assert.deepEqual(foundationGuideSuits([[], [card('A', 'spades')], [], []]), ['clubs', null, 'diamonds', 'hearts'])
})

test('placeholder rendering shows a guide suit or small King without exposing decorative text', async () => {
  const vite = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { CardView } = await vite.ssrLoadModule('/src/games/solitaire/ui/CardView.tsx')
    const foundation = renderToStaticMarkup(createElement(CardView, { placeholder: true, placeholderKind: 'foundation', placeholderSuit: 'hearts' }))
    const tableau = renderToStaticMarkup(createElement(CardView, { placeholder: true, placeholderKind: 'tableau' }))
    const numbered = renderToStaticMarkup(createElement(CardView, { card: card('10', 'hearts') }))
    const traditional = renderToStaticMarkup(createElement(CardView, { card: card('10', 'hearts'), cardFaces: 'traditional' }))
    assert.match(foundation, /zen-card-placeholder--foundation/)
    assert.match(foundation, /zen-card-placeholder__suit/)
    assert.match(foundation, /aria-hidden="true"/)
    assert.match(tableau, /zen-card-placeholder__king">K</)
    assert.doesNotMatch(tableau, /zen-card-placeholder__suit/)
    assert.equal((numbered.match(/<path /g) ?? []).length, 2)
    assert.equal((traditional.match(/<path /g) ?? []).length, 12)
    assert.match(numbered, /zen-card-hero-suit/)
    assert.match(traditional, /data-face-layout="traditional"/)
    assert.equal((numbered.match(/zen-card-corner__rank--double/g) ?? []).length, 1)
    assert.doesNotMatch(numbered, /zen-card-corner--bottom/)
    assert.doesNotMatch(numbered, /<img/)
  } finally {
    await vite.close()
  }
})

test('simplified faces use one corner index and approved artwork; traditional faces retain both indices and pips', async () => {
  const vite = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { CardView } = await vite.ssrLoadModule('/src/games/solitaire/ui/CardView.tsx')
    for (const [rank, suit] of [['7', 'spades'], ['10', 'hearts'], ['4', 'clubs'], ['A', 'diamonds']] as const) {
      const simple = renderToStaticMarkup(createElement(CardView, { card: card(rank, suit), cardFaces: 'simplified' }))
      const classic = renderToStaticMarkup(createElement(CardView, { card: card(rank, suit), cardFaces: 'traditional' }))
      assert.equal((simple.match(/<path /g) ?? []).length, 2, `${rank} of ${suit} needs one lower-right suit and one corner suit`)
      assert.equal((classic.match(/<path /g) ?? []).length, numberedPips[rank].length + 2)
      assert.match(simple, /zen-card-face--simplified/)
      assert.match(simple, /zen-card-hero-suit/)
      assert.doesNotMatch(simple, /zen-card-corner--bottom/)
      assert.match(classic, /zen-card-corner--bottom/)
    }
    for (const rank of ['J', 'Q', 'K'] as const) {
      const simple = renderToStaticMarkup(createElement(CardView, { card: card(rank, 'hearts'), cardFaces: 'simplified' }))
      const classic = renderToStaticMarkup(createElement(CardView, { card: card(rank, 'hearts'), cardFaces: 'traditional' }))
      const asset = `/cards/english-pattern/${{ J: 'jack', Q: 'queen', K: 'king' }[rank]}_of_hearts.svg`
      assert.match(simple, /zen-card-face--simplified-court/)
      assert.match(simple, /zen-card-portrait[^>]*viewBox="85 30 245 280"/)
      assert.match(simple, new RegExp(`<image href="${asset}"`))
      assert.doesNotMatch(simple, /zen-card-corner--bottom/)
      assert.match(classic, new RegExp(`<img[^>]*src="${asset}"`))
      assert.match(classic, /zen-card-corner--bottom/)
    }
    const interactive = renderToStaticMarkup(createElement(CardView, {
      card: card('10', 'spades'),
      cardFaces: 'simplified',
      onClick: () => {},
    }))
    assert.match(interactive, /<button type="button"/)
    assert.match(interactive, /aria-label="10 of Spades"/)
    assert.match(interactive, /aria-pressed="false"/)
  } finally {
    await vite.close()
  }
})
