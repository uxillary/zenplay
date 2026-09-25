import assert from 'node:assert/strict'
import test from 'node:test'
import { chooseComputerMove, createNoughtsState, makeNoughtsMove } from './engine.ts'
import type { NoughtsState } from './types.ts'

const play = (moves: number[]): NoughtsState => moves.reduce(makeNoughtsMove, createNoughtsState())

test('starts with an empty board and X to play', () => {
  assert.deepEqual(createNoughtsState(), { board: Array(9).fill(null), currentPlayer: 'X', status: 'playing', winner: null, winningLine: null })
})

test('makes legal moves, alternates turns and rejects occupied cells', () => {
  const first = makeNoughtsMove(createNoughtsState(), 4)
  assert.equal(first.currentPlayer, 'O')
  assert.equal(first.board[4], 'X')
  assert.equal(makeNoughtsMove(first, 4), first)
  assert.equal(makeNoughtsMove(first, 9), first)
})

test('detects all rows, columns and diagonals', () => {
  for (const moves of [[0, 3, 1, 4, 2], [3, 0, 4, 1, 5], [6, 0, 7, 1, 8], [0, 1, 3, 2, 6], [1, 0, 4, 2, 7], [2, 0, 5, 1, 8], [0, 1, 4, 2, 8], [2, 0, 4, 1, 6]]) {
    const state = play(moves)
    assert.equal(state.status, 'won', `moves ${moves}`)
    assert.equal(state.winner, moves.length % 2 === 1 ? 'X' : 'O')
    assert.equal(state.winningLine?.length, 3)
  }
})

test('detects a draw and rejects moves after completion', () => {
  const state = play([0, 1, 2, 4, 3, 5, 7, 6, 8])
  assert.equal(state.status, 'draw')
  assert.equal(state.winner, null)
  assert.equal(makeNoughtsMove(state, 8), state)
})

test('computer chooses only empty legal squares in either difficulty', () => {
  const state = play([4, 0])
  for (const difficulty of ['easy', 'standard'] as const) {
    const move = chooseComputerMove(state, difficulty, () => 0.5)
    assert.notEqual(move, null)
    assert.equal(state.board[move!], null)
  }
})

test('standard computer takes a win and blocks an immediate loss', () => {
  const winning = { ...play([0, 3, 1, 4]), currentPlayer: 'X' as const }
  assert.equal(chooseComputerMove(winning, 'standard'), 2)
  const blocking: NoughtsState = { ...play([0, 1, 4]), currentPlayer: 'O' }
  assert.equal(chooseComputerMove(blocking, 'standard'), 8)
})

test('easy computer randomness is injectable and bounded', () => {
  const state = createNoughtsState()
  assert.equal(chooseComputerMove(state, 'easy', () => 0), 0)
  assert.equal(chooseComputerMove(state, 'easy', () => 1), 8)
})
