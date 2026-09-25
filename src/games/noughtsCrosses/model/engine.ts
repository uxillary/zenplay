import { WINNING_LINES, type Difficulty, type Mark, type NoughtsState } from './types.ts'

export const createNoughtsState = (): NoughtsState => ({
  board: Array.from({ length: 9 }, () => null),
  currentPlayer: 'X',
  status: 'playing',
  winner: null,
  winningLine: null,
})

export const makeNoughtsMove = (state: NoughtsState, index: number): NoughtsState => {
  if (state.status !== 'playing' || !Number.isInteger(index) || index < 0 || index >= 9 || state.board[index] !== null) return state
  const board = [...state.board]
  board[index] = state.currentPlayer
  const winningLine = WINNING_LINES.find((line) => line.every((cell) => board[cell] === state.currentPlayer))
  if (winningLine) return { board, currentPlayer: state.currentPlayer, status: 'won', winner: state.currentPlayer, winningLine: [...winningLine] }
  if (board.every((cell) => cell !== null)) return { board, currentPlayer: state.currentPlayer, status: 'draw', winner: null, winningLine: null }
  return { board, currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X', status: 'playing', winner: null, winningLine: null }
}

const minimax = (board: Array<Mark | null>, player: Mark, computer: Mark, depth: number): number => {
  for (const line of WINNING_LINES) {
    if (line.every((cell) => board[cell] === computer)) return 10 - depth
    if (line.every((cell) => board[cell] === (computer === 'X' ? 'O' : 'X'))) return depth - 10
  }
  const empty = board.flatMap((cell, index) => cell === null ? [index] : [])
  if (empty.length === 0) return 0
  const scores = empty.map((index) => {
    board[index] = player
    const score = minimax(board, player === 'X' ? 'O' : 'X', computer, depth + 1)
    board[index] = null
    return score
  })
  return player === computer ? Math.max(...scores) : Math.min(...scores)
}

export const chooseComputerMove = (
  state: NoughtsState,
  difficulty: Difficulty,
  random: () => number = Math.random,
): number | null => {
  if (state.status !== 'playing') return null
  const empty = state.board.flatMap((cell, index) => cell === null ? [index] : [])
  if (empty.length === 0) return null
  if (difficulty === 'easy') {
    const choice = Math.floor(Math.min(0.999999, Math.max(0, random())) * empty.length)
    return empty[choice]
  }
  const computer = state.currentPlayer
  let bestMove = empty[0]
  let bestScore = Number.NEGATIVE_INFINITY
  for (const index of empty) {
    const board = [...state.board]
    board[index] = computer
    const score = minimax(board, computer === 'X' ? 'O' : 'X', computer, 1)
    if (score > bestScore) { bestScore = score; bestMove = index }
  }
  return bestMove
}
