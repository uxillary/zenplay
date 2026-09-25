import { useEffect, useRef, useState } from 'react'
import type { AppSettings } from '../../../lib/settings'
import { createSessionId } from '../../../persistence/gameSave'
import { readStatistics, recordGameCompleted, recordGameStarted } from '../../../persistence/statistics'
import type { GameStatistics } from '../../../persistence/types'
import { GameDialog } from '../../../components/GameDialog'
import { GameToolbar } from '../../../components/GameToolbar'
import { chooseComputerMove, createNoughtsState, makeNoughtsMove } from '../model/engine'
import type { Difficulty, GameMode, Mark, NoughtsState } from '../model/types'

type Props = { settings: AppSettings; onBack: () => void }
const markName = (mark: Mark) => mark === 'X' ? 'cross' : 'nought'
const playerMessage = (mark: Mark, mode: GameMode) => mode === 'computer' && mark === 'O' ? 'Computer’s turn.' : `${mark === 'X' ? 'Crosses' : 'Noughts'}’ turn.`

export const NoughtsCrossesScreen = ({ settings, onBack }: Props) => {
  const [state, setState] = useState<NoughtsState>(createNoughtsState)
  const [mode, setMode] = useState<GameMode>('two-players')
  const [difficulty, setDifficulty] = useState<Difficulty>('standard')
  const [showRules, setShowRules] = useState(false)
  const [statistics, setStatistics] = useState<GameStatistics | null>(null)
  const computerPending = mode === 'computer' && state.status === 'playing' && state.currentPlayer === 'O'
  const [announcement, setAnnouncement] = useState('Crosses’ turn.')
  const session = useRef(createSessionId())
  const inputLocked = useRef(false)
  const completedSession = useRef<string | null>(null)
  const computerTimer = useRef<number | null>(null)

  useEffect(() => { void recordGameStarted('noughts-crosses') }, [])
  useEffect(() => () => { if (computerTimer.current !== null) window.clearTimeout(computerTimer.current) }, [])
  useEffect(() => {
    if (state.status === 'playing' || completedSession.current === session.current) return
    completedSession.current = session.current
    const category = state.status === 'draw'
      ? 'draw'
      : mode === 'computer'
        ? state.winner === 'X' ? 'player-win' : 'computer-win'
        : state.winner === 'X' ? 'crosses-win' : 'noughts-win'
    const moves = state.board.filter((cell) => cell !== null).length
    void recordGameCompleted('noughts-crosses', session.current, moves, undefined, category)
  }, [mode, state])

  useEffect(() => {
    if (mode !== 'computer' || state.status !== 'playing' || state.currentPlayer !== 'O') return
    computerTimer.current = window.setTimeout(() => {
      const index = chooseComputerMove(state, difficulty)
      if (index !== null) {
        const next = makeNoughtsMove(state, index)
        setState(next)
        setAnnouncement(next.status === 'playing' ? 'Computer placed a nought. Crosses’ turn.' : next.status === 'draw' ? 'Computer placed a nought. It’s a draw.' : 'Computer placed a nought. Noughts win.')
      }
      inputLocked.current = false
    }, settings.reducedMotion ? 0 : 180)
    return () => { if (computerTimer.current !== null) window.clearTimeout(computerTimer.current) }
  }, [difficulty, mode, settings.reducedMotion, state])

  useEffect(() => {
    if (showRules) void readStatistics('noughts-crosses').then(setStatistics)
  }, [showRules])

  const startAgain = () => {
    if (computerTimer.current !== null) window.clearTimeout(computerTimer.current)
    inputLocked.current = false
    setState(createNoughtsState())
    setAnnouncement('New round. Crosses’ turn.')
    session.current = createSessionId()
    completedSession.current = null
    void recordGameStarted('noughts-crosses')
  }

  const chooseMode = (nextMode: GameMode) => {
    if (state.status === 'playing' && state.board.some((mark) => mark !== null)) return
    setMode(nextMode)
    if (state.status !== 'playing') {
      const nextSession = createSessionId()
      session.current = nextSession
      completedSession.current = null
      setState(createNoughtsState())
      void recordGameStarted('noughts-crosses')
    }
    setAnnouncement('Crosses’ turn.')
  }

  const play = (index: number) => {
    if (inputLocked.current || computerPending || state.status !== 'playing' || mode === 'computer' && state.currentPlayer === 'O') return
    const next = makeNoughtsMove(state, index)
    if (next === state) return
    if (mode === 'computer' && next.status === 'playing') inputLocked.current = true
    setState(next)
    if (next.status === 'playing') setAnnouncement(playerMessage(next.currentPlayer, mode))
    else setAnnouncement(next.status === 'draw' ? 'It’s a draw.' : `${next.winner === 'X' ? 'Crosses' : 'Noughts'} win.`)
  }

  const completeMessage = state.status === 'draw'
    ? 'It’s a draw.'
    : mode === 'computer' && state.winner === 'X'
      ? 'You win.'
      : mode === 'computer'
        ? 'Computer wins.'
        : `${state.winner === 'X' ? 'Crosses' : 'Noughts'} win.`

  return <div className="noughts-screen space-y-3">
    <GameToolbar>
      <div className="noughts-mode-choices" role="group" aria-label="Game mode">
        <button type="button" className="zen-game-button" aria-pressed={mode === 'two-players'} disabled={state.status === 'playing' && state.board.some((mark) => mark !== null)} onClick={() => chooseMode('two-players')}>Two Players</button>
        <button type="button" className="zen-game-button" aria-pressed={mode === 'computer'} disabled={state.status === 'playing' && state.board.some((mark) => mark !== null)} onClick={() => chooseMode('computer')}>Play Computer</button>
      </div>
      {mode === 'computer' ? <label className="noughts-difficulty">Difficulty
        <select aria-label="Computer difficulty" value={difficulty} disabled={state.board.some((mark) => mark !== null)} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
          <option value="easy">Easy</option><option value="standard">Standard</option>
        </select>
      </label> : null}
      <button type="button" onClick={() => setShowRules(true)} className="zen-game-button">Rules</button>
    </GameToolbar>
    <p className="noughts-turn" aria-live="polite" aria-atomic="true">{computerPending ? 'Computer is choosing a square.' : announcement}</p>
    <div className={`noughts-board ${settings.gamePieceScale === 'large' || settings.simpleMode ? 'noughts-board--large' : ''}`} role="group" aria-label="Noughts and Crosses board">
      {state.board.map((mark, index) => {
        const row = Math.floor(index / 3) + 1
        const column = index % 3 + 1
        const label = mark ? `${markName(mark)}` : 'empty'
        const winning = state.winningLine?.includes(index) ?? false
        return <button
          key={index}
          type="button"
          className={`noughts-cell ${winning ? 'noughts-cell--winning' : ''}`}
          aria-label={`Row ${row}, column ${column}, ${label}`}
          aria-disabled={mark !== null || state.status !== 'playing' || computerPending || mode === 'computer' && state.currentPlayer === 'O'}
          onClick={() => play(index)}
        >
          <span aria-hidden="true" className={mark === 'X' ? 'noughts-mark--cross' : mark === 'O' ? 'noughts-mark--nought' : ''}>{mark === 'X' ? '×' : mark === 'O' ? '○' : ''}</span>
        </button>
      })}
    </div>
    <div className="noughts-bottom-row"><span>{state.board.filter(Boolean).length} moves</span><button type="button" onClick={startAgain} className="zen-game-button">New Round</button></div>

    {showRules ? <GameDialog title="How to play Noughts & Crosses" description="Players take turns placing a nought or a cross in an empty square. The first to make three in a row wins: across, down, or diagonally. The round is a draw when all nine squares are filled without a winner. Choose Two Players to share the device, or Play Computer for a local game. It is also known as Tic-Tac-Toe." onDismiss={() => setShowRules(false)}>
      <div className="space-y-2 text-lg"><p>{statistics ? `${statistics.gamesStarted} rounds played · ${statistics.gamesCompleted} completed.` : 'Statistics are stored on this device.'}</p><p>{statistics ? `Crosses wins: ${statistics.completionBreakdown['crosses-win'] ?? 0} · Noughts wins: ${statistics.completionBreakdown['noughts-win'] ?? 0} · Player wins: ${statistics.completionBreakdown['player-win'] ?? 0} · Computer wins: ${statistics.completionBreakdown['computer-win'] ?? 0} · Draws: ${statistics.completionBreakdown.draw ?? 0}.` : null}</p></div>
      <button type="button" onClick={() => setShowRules(false)} className="zen-game-button">Close Rules</button>
    </GameDialog> : null}
    {state.status !== 'playing' ? <GameDialog title={completeMessage} description={mode === 'computer' && state.winner === 'X' ? 'A well played round.' : 'The round is complete.'}>
      <div className="flex flex-wrap gap-3"><button type="button" onClick={startAgain} className="zen-game-button zen-game-button--primary">Play Again</button><button type="button" onClick={onBack} className="zen-game-button">Back to Games</button></div>
    </GameDialog> : null}
  </div>
}
