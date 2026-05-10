import assert from 'node:assert/strict'
import test from 'node:test'
import { applyMove, dealFromStock } from './engine.ts'
import { findObviousMoves, isValidMove, isWin, sameLocation } from './rules.ts'
import type { Card, SolitaireState } from './types.ts'

const card = (rank: Card['rank'], suit: Card['suit'], faceUp = true): Card => ({
  id: `${suit}-${rank}`,
  rank,
  suit,
  faceUp,
})

const state = (overrides: Partial<SolitaireState> = {}): SolitaireState => ({
  tableau: [[], [], [], [], [], [], []],
  foundations: [[], [], [], []],
  stock: [],
  waste: [],
  history: [],
  ...overrides,
})

test('allows a descending alternate-color tableau move', () => {
  const sourceCard = card('3', 'spades')
  const game = state({
    tableau: [[sourceCard], [card('4', 'hearts')], [], [], [], [], []],
  })

  assert.equal(
    isValidMove(game, {
      from: { type: 'tableau', index: 0 },
      to: { type: 'tableau', index: 1 },
      cardId: sourceCard.id,
    }),
    true,
  )
})

test('rejects same-color or non-descending tableau moves', () => {
  const blackThree = card('3', 'spades')
  const blackFour = card('4', 'clubs')
  const redFive = card('5', 'hearts')
  const game = state({
    tableau: [[blackThree], [blackFour], [redFive], [], [], [], []],
  })

  assert.equal(
    isValidMove(game, {
      from: { type: 'tableau', index: 0 },
      to: { type: 'tableau', index: 1 },
      cardId: blackThree.id,
    }),
    false,
  )
  assert.equal(
    isValidMove(game, {
      from: { type: 'tableau', index: 0 },
      to: { type: 'tableau', index: 2 },
      cardId: blackThree.id,
    }),
    false,
  )
})

test('allows only kings onto empty tableau piles', () => {
  const king = card('K', 'spades')
  const queen = card('Q', 'hearts')
  const game = state({
    tableau: [[king], [queen], [], [], [], [], []],
  })

  assert.equal(
    isValidMove(game, {
      from: { type: 'tableau', index: 0 },
      to: { type: 'tableau', index: 2 },
      cardId: king.id,
    }),
    true,
  )
  assert.equal(
    isValidMove(game, {
      from: { type: 'tableau', index: 1 },
      to: { type: 'tableau', index: 2 },
      cardId: queen.id,
    }),
    false,
  )
})

test('moves aces to empty foundations', () => {
  const ace = card('A', 'hearts')
  const game = state({
    tableau: [[ace], [], [], [], [], [], []],
  })

  assert.equal(
    isValidMove(game, {
      from: { type: 'tableau', index: 0 },
      to: { type: 'foundation', index: 0 },
      cardId: ace.id,
    }),
    true,
  )
})

test('moves next-suit cards to foundations', () => {
  const two = card('2', 'hearts')
  const game = state({
    tableau: [[two], [], [], [], [], [], []],
    foundations: [[card('A', 'hearts')], [], [], []],
  })

  assert.equal(
    isValidMove(game, {
      from: { type: 'tableau', index: 0 },
      to: { type: 'foundation', index: 0 },
      cardId: two.id,
    }),
    true,
  )
})

test('rejects foundation moves with wrong suit or skipped rank', () => {
  const twoClubs = card('2', 'clubs')
  const threeHearts = card('3', 'hearts')
  const game = state({
    tableau: [[twoClubs], [threeHearts], [], [], [], [], []],
    foundations: [[card('A', 'hearts')], [], [], []],
  })

  assert.equal(
    isValidMove(game, {
      from: { type: 'tableau', index: 0 },
      to: { type: 'foundation', index: 0 },
      cardId: twoClubs.id,
    }),
    false,
  )
  assert.equal(
    isValidMove(game, {
      from: { type: 'tableau', index: 1 },
      to: { type: 'foundation', index: 0 },
      cardId: threeHearts.id,
    }),
    false,
  )
})

test('draws one stock card face-up to waste and recycles waste when stock is empty', () => {
  const topStockCard = card('7', 'clubs', false)
  const game = state({
    stock: [card('8', 'spades', false), topStockCard],
  })

  const afterDraw = dealFromStock(game)

  assert.deepEqual(afterDraw.stock.map((stockCard) => stockCard.id), ['spades-8'])
  assert.equal(afterDraw.waste.at(-1)?.id, topStockCard.id)
  assert.equal(afterDraw.waste.at(-1)?.faceUp, true)

  const afterRecycle = dealFromStock(state({ waste: [card('A', 'diamonds'), card('2', 'diamonds')] }))

  assert.deepEqual(afterRecycle.waste, [])
  assert.deepEqual(
    afterRecycle.stock.map((stockCard) => [stockCard.id, stockCard.faceUp]),
    [
      ['diamonds-2', false],
      ['diamonds-A', false],
    ],
  )
})

test('detects completed foundation piles as a win', () => {
  const completedFoundation = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
  ].map((rank) => card(rank as Card['rank'], 'spades'))

  assert.equal(isWin(state({ foundations: [completedFoundation, completedFoundation, completedFoundation, completedFoundation] })), true)
  assert.equal(isWin(state({ foundations: [completedFoundation, completedFoundation, completedFoundation, []] })), false)
})

test('compares locations without relying on object stringification', () => {
  assert.equal(sameLocation({ type: 'waste' }, { type: 'waste' }), true)
  assert.equal(sameLocation({ type: 'tableau', index: 1 }, { type: 'tableau', index: 1 }), true)
  assert.equal(sameLocation({ type: 'foundation', index: 1 }, { type: 'foundation', index: 2 }), false)
  assert.equal(sameLocation({ type: 'tableau', index: 1 }, { type: 'foundation', index: 1 }), false)
})

test('finds obvious legal moves without solving the game', () => {
  const three = card('3', 'spades')
  const game = state({
    tableau: [[three], [card('4', 'hearts')], [], [], [], [], []],
  })

  assert.deepEqual(findObviousMoves(game), [
    {
      from: { type: 'tableau', index: 0 },
      to: { type: 'tableau', index: 1 },
      cardId: three.id,
    },
  ])
})

test('returns no obvious moves when no currently visible move is valid', () => {
  const game = state({
    tableau: [[card('3', 'spades')], [card('5', 'hearts')], [], [], [], [], []],
  })

  assert.deepEqual(findObviousMoves(game), [])
})

test('rejects moves from face-down cards and non-top waste cards', () => {
  const faceDown = card('3', 'spades', false)
  const wasteBottom = card('A', 'clubs')
  const wasteTop = card('2', 'clubs')
  const game = state({
    tableau: [[faceDown], [card('4', 'hearts')], [], [], [], [], []],
    waste: [wasteBottom, wasteTop],
    foundations: [[], [card('A', 'clubs')], [], []],
  })

  assert.equal(
    isValidMove(game, {
      from: { type: 'tableau', index: 0 },
      to: { type: 'tableau', index: 1 },
      cardId: faceDown.id,
    }),
    false,
  )
  assert.equal(
    isValidMove(game, {
      from: { type: 'waste' },
      to: { type: 'foundation', index: 0 },
      cardId: wasteBottom.id,
    }),
    false,
  )
})

test('applies valid moves through the engine without changing invalid moves', () => {
  const three = card('3', 'spades')
  const game = state({
    tableau: [[three], [card('4', 'hearts')], [], [], [], [], []],
  })

  const afterMove = applyMove(game, {
    from: { type: 'tableau', index: 0 },
    to: { type: 'tableau', index: 1 },
    cardId: three.id,
  })
  const afterInvalidMove = applyMove(game, {
    from: { type: 'tableau', index: 0 },
    to: { type: 'foundation', index: 0 },
    cardId: three.id,
  })

  assert.deepEqual(afterMove.tableau[0], [])
  assert.equal(afterMove.tableau[1].at(-1)?.id, three.id)
  assert.equal(afterMove.history.length, 1)
  assert.equal(afterInvalidMove, game)
})
