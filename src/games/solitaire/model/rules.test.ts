import assert from 'node:assert/strict'
import test from 'node:test'
import { applyMove, dealFromStock, undo } from './engine.ts'
import { canAutoComplete, findAutoCompleteMove, findFoundationMove, findHint, findObviousMoves, getAutoFinishPlan, isValidMove, isWin, sameLocation } from './rules.ts'
import { RANKS, type Card, type SolitaireState } from './types.ts'

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

test('does not start a duplicate foundation for a suit already in play', () => {
  const duplicateAce = card('A', 'hearts')
  const game = state({
    tableau: [[duplicateAce], [], [], [], [], [], []],
    foundations: [[card('A', 'hearts')], [], [], []],
  })
  assert.equal(isValidMove(game, {
    from: { type: 'tableau', index: 0 }, to: { type: 'foundation', index: 1 }, cardId: duplicateAce.id,
  }), false)
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

test('Draw 3 transfers up to three cards and undo restores stock and waste', () => {
  const game = state({ stock: [card('8', 'spades', false), card('9', 'spades', false), card('10', 'spades', false), card('J', 'spades', false)] })
  const drawn = dealFromStock(game, 3)

  assert.deepEqual(drawn.stock.map((item) => item.id), ['spades-8'])
  assert.deepEqual(drawn.waste.map((item) => item.id), ['spades-J', 'spades-10', 'spades-9'])
  assert.ok(drawn.waste.every((item) => item.faceUp))
  assert.deepEqual(undo(drawn), game)
})

test('Draw 3 draws only the cards remaining in stock', () => {
  const drawn = dealFromStock(state({ stock: [card('A', 'clubs', false), card('2', 'clubs', false)] }), 3)
  assert.equal(drawn.stock.length, 0)
  assert.equal(drawn.waste.length, 2)
})

test('Draw 3 keeps every card exactly once across stock and waste', () => {
  const deck = RANKS.slice(0, 13).map((rank) => card(rank, 'clubs', false))
  const firstDeal = dealFromStock(state({ stock: deck }), 3)
  const recycled = dealFromStock(firstDeal, 3)
  const allCards = [...recycled.stock, ...recycled.waste]
  assert.equal(allCards.length, deck.length)
  assert.equal(new Set(allCards.map((item) => item.id)).size, deck.length)
})

test('stock recycle preserves card order for the next Draw 3', () => {
  const recycled = dealFromStock(state({ waste: [card('A', 'diamonds'), card('2', 'diamonds'), card('3', 'diamonds')] }), 3)
  assert.deepEqual(recycled.stock.map(({ id, faceUp }) => [id, faceUp]), [
    ['diamonds-3', false], ['diamonds-2', false], ['diamonds-A', false],
  ])
  const drawn = dealFromStock(recycled, 3)
  assert.deepEqual(drawn.waste.map(({ id }) => id), ['diamonds-A', 'diamonds-2', 'diamonds-3'])
})

test('detects completed foundation piles as a win', () => {
  const completed = (suit: Card['suit']) => RANKS.map((rank) => card(rank, suit))
  assert.equal(isWin(state({ foundations: [completed('clubs'), completed('diamonds'), completed('hearts'), completed('spades')] })), true)
  assert.equal(isWin(state({ foundations: [completed('spades'), completed('spades'), completed('hearts'), completed('clubs')] })), false)
  assert.equal(isWin(state({ foundations: [completed('clubs'), completed('diamonds'), completed('hearts'), []] })), false)
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

test('finds a legal foundation move for double-click', () => {
  const ace = card('A', 'hearts')
  const game = state({
    tableau: [[ace], [], [], [], [], [], []],
  })

  assert.deepEqual(findFoundationMove(game, { type: 'tableau', index: 0 }, ace.id), {
    from: { type: 'tableau', index: 0 },
    to: { type: 'foundation', index: 0 },
    cardId: ace.id,
  })
})

test('returns no double-click foundation move when illegal', () => {
  const three = card('3', 'hearts')
  const game = state({
    tableau: [[three], [], [], [], [], [], []],
    foundations: [[card('A', 'hearts')], [], [], []],
  })

  assert.equal(findFoundationMove(game, { type: 'tableau', index: 0 }, three.id), null)
})

test('auto-finish finds a complete deterministic foundation sequence', () => {
  const game = state({
    tableau: [[card('A', 'hearts')], [card('2', 'hearts')], [], [], [], [], []],
  })
  assert.equal(
    canAutoComplete(game),
    true,
  )
  assert.equal(getAutoFinishPlan(game)?.length, 2)
})

test('does not allow auto-complete while hidden tableau cards remain', () => {
  assert.equal(
    canAutoComplete(
      state({
        tableau: [[card('A', 'hearts', false), card('2', 'hearts')], [], [], [], [], [], []],
      }),
    ),
    false,
  )
})

test('auto-complete only returns legal foundation moves', () => {
  const ace = card('A', 'hearts')
  const two = card('2', 'hearts')
  const game = state({
    tableau: [[ace], [two], [], [], [], [], []],
  })

  assert.deepEqual(findAutoCompleteMove(game), {
    from: { type: 'tableau', index: 0 },
    to: { type: 'foundation', index: 0 },
    cardId: ace.id,
  })
})

test('auto-finish is unavailable when a tableau choice remains', () => {
  const game = state({ tableau: [[card('3', 'spades')], [card('4', 'hearts')], [], [], [], [], []] })
  assert.equal(canAutoComplete(game), false)
})

test('hint prioritizes a legal move that exposes a hidden tableau card', () => {
  const four = card('4', 'clubs')
  const game = state({
    tableau: [[card('9', 'spades', false), four], [card('5', 'hearts')], [], [], [], [], []],
  })
  assert.deepEqual(findHint(game), {
    type: 'move',
    move: { from: { type: 'tableau', index: 0 }, to: { type: 'tableau', index: 1 }, cardId: four.id },
  })
})

test('hint suggests a foundation move before drawing from stock', () => {
  const ace = card('A', 'hearts')
  const game = state({ tableau: [[ace], [], [], [], [], [], []], stock: [card('2', 'clubs', false)] })
  assert.deepEqual(findHint(game), {
    type: 'move',
    move: { from: { type: 'tableau', index: 0 }, to: { type: 'foundation', index: 0 }, cardId: ace.id },
  })
})

test('hint suggests a stock action when no board move is available', () => {
  const game = state({ tableau: [[card('3', 'spades')], [card('5', 'hearts')], [], [], [], [], []], stock: [card('A', 'clubs', false)] })
  assert.deepEqual(findHint(game), { type: 'deal' })
})

test('invalid self and out-of-range moves are rejected safely', () => {
  const four = card('4', 'clubs')
  const game = state({ tableau: [[card('5', 'hearts'), four], [], [], [], [], [], []] })
  assert.equal(isValidMove(game, { from: { type: 'tableau', index: 0 }, to: { type: 'tableau', index: 0 }, cardId: four.id }), false)
  assert.equal(isValidMove(game, { from: { type: 'tableau', index: 8 }, to: { type: 'tableau', index: 1 }, cardId: four.id }), false)
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

test('undo restores a legal tableau move and cannot go before the initial state', () => {
  const three = card('3', 'spades')
  const game = state({ tableau: [[three], [card('4', 'hearts')], [], [], [], [], []] })
  const moved = applyMove(game, { from: { type: 'tableau', index: 0 }, to: { type: 'tableau', index: 1 }, cardId: three.id })
  assert.deepEqual(undo(moved), game)
  assert.equal(undo(game), game)
})
