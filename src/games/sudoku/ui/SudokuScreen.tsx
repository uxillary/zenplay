import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { AppSettings } from '../../../lib/settings'
import { createSessionId, deleteActiveSave, saveActiveGame } from '../../../persistence/gameSave'
import { readStatistics, recordGameCompleted, recordGameStarted } from '../../../persistence/statistics'
import type { GameStatistics } from '../../../persistence/types'
import { GameDialog } from '../../../components/GameDialog'
import { GameToolbar } from '../../../components/GameToolbar'
import { createSudokuState, enterValue, eraseCell, fillHint, setShowMistakes, toggleNote, undoSudoku } from '../model/engine'
import { findSudokuPuzzle, getPuzzleForNewGame } from '../model/puzzles'
import { getConflictingCells, isSudokuComplete } from '../model/rules'
import { restoreSudokuState, serializeSudokuState } from '../model/persistence'
import type { SudokuDifficulty, SudokuState } from '../model/types'
import { loadSudokuSave } from '../save'

type Props = {
  settings: AppSettings
  onBack: () => void
  onSaveAvailabilityChange: (hasSave: boolean) => void
}

type Action =
  | { type: 'restore'; state: SudokuState }
  | { type: 'new'; state: SudokuState }
  | { type: 'value'; cell: number; value: number }
  | { type: 'erase'; cell: number }
  | { type: 'note'; cell: number; value: number }
  | { type: 'hint' }
  | { type: 'undo' }
  | { type: 'show-mistakes'; value: boolean }

const reducer = (state: SudokuState, action: Action): SudokuState => {
  if (action.type === 'restore' || action.type === 'new') return action.state
  if (action.type === 'value') return enterValue(state, action.cell, action.value)
  if (action.type === 'erase') return eraseCell(state, action.cell)
  if (action.type === 'note') return toggleNote(state, action.cell, action.value)
  if (action.type === 'hint') return fillHint(state)
  if (action.type === 'undo') return undoSudoku(state)
  if (action.type === 'show-mistakes') return setShowMistakes(state, action.value)
  return state
}

const difficulties: SudokuDifficulty[] = ['easy', 'medium', 'hard']
const difficultyName = (difficulty: SudokuDifficulty): string => difficulty[0].toUpperCase() + difficulty.slice(1)

const cellDescription = (
  state: SudokuState,
  cell: number,
  conflicting: Set<number>,
  hintCell: number | null,
): string => {
  const puzzle = findSudokuPuzzle(state.puzzleId)
  const row = Math.floor(cell / 9) + 1
  const column = cell % 9 + 1
  const value = state.values[cell]
  const given = puzzle?.givens[cell] !== 0
  const parts = [`Row ${row}`, `column ${column}`, value === 0 ? 'empty' : String(value), given ? 'given' : value === 0 ? 'editable' : 'entered']
  if (state.notes[cell].length > 0) parts.push(`notes ${state.notes[cell].join(', ')}`)
  if (state.showMistakes && value !== 0 && (conflicting.has(cell) || value !== puzzle?.solution[cell])) parts.push('mistake')
  if (hintCell === cell) parts.push('hint')
  return parts.join(', ')
}

export const SudokuScreen = ({ settings, onBack, onSaveAvailabilityChange }: Props) => {
  const [state, dispatch] = useReducer(reducer, undefined, () => createSudokuState('easy-1'))
  const [ready, setReady] = useState(false)
  const [selectedCell, setSelectedCell] = useState(() => Math.max(0, findSudokuPuzzle('easy-1')?.givens.findIndex((value) => value === 0) ?? 0))
  const [notesMode, setNotesMode] = useState(false)
  const [message, setMessage] = useState('')
  const [hintCell, setHintCell] = useState<number | null>(null)
  const [showNewPuzzle, setShowNewPuzzle] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [newDifficulty, setNewDifficulty] = useState<SudokuDifficulty>('easy')
  const [statistics, setStatistics] = useState<GameStatistics | null>(null)
  const session = useRef<{ sessionId: string; createdAt: string } | null>(null)
  const persistenceQueue = useRef<Promise<void>>(Promise.resolve())
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([])
  const moveFocusAfterSelection = useRef(false)
  const puzzle = useMemo(() => findSudokuPuzzle(state.puzzleId), [state.puzzleId])
  const conflicts = useMemo(() => getConflictingCells(state.values), [state.values])
  const complete = Boolean(puzzle && isSudokuComplete(state, puzzle))

  useEffect(() => {
    let mounted = true
    void (async () => {
      const saved = await loadSudokuSave()
      if (!mounted) return
      const restored = saved ? restoreSudokuState(saved.state) : null
      if (saved && restored) {
        session.current = { sessionId: saved.sessionId, createdAt: saved.createdAt }
        dispatch({ type: 'restore', state: restored })
        const firstEditable = restored.values.findIndex((value, index) => findSudokuPuzzle(restored.puzzleId)?.givens[index] === 0 && value === 0)
        if (firstEditable >= 0) setSelectedCell(firstEditable)
      } else {
        session.current = { sessionId: createSessionId(), createdAt: new Date().toISOString() }
        await recordGameStarted('sudoku')
      }
      if (mounted) setReady(true)
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!ready || !session.current || !puzzle) return
    const snapshot = serializeSudokuState(state)
    const currentSession = session.current
    persistenceQueue.current = persistenceQueue.current.then(async () => {
      if (isSudokuComplete(snapshot, puzzle)) {
        const recorded = await recordGameCompleted('sudoku', currentSession.sessionId, snapshot.history.length, undefined, snapshot.difficulty)
        if (recorded) {
          await deleteActiveSave('sudoku')
          onSaveAvailabilityChange(false)
        }
        return
      }
      if (await saveActiveGame('sudoku', snapshot, currentSession)) onSaveAvailabilityChange(true)
    })
  }, [onSaveAvailabilityChange, puzzle, ready, state])

  useEffect(() => {
    if (!moveFocusAfterSelection.current) return
    cellRefs.current[selectedCell]?.focus()
    moveFocusAfterSelection.current = false
  }, [selectedCell])

  useEffect(() => {
    if (showNewPuzzle || showRules) void readStatistics('sudoku').then(setStatistics)
  }, [showNewPuzzle, showRules])

  const updateCell = (value: number) => {
    if (!puzzle || puzzle.givens[selectedCell] !== 0) {
      setMessage('Choose an empty cell first.')
      return
    }
    if (notesMode) {
      dispatch({ type: 'note', cell: selectedCell, value })
      setMessage(`Note ${value} ${state.notes[selectedCell].includes(value) ? 'removed' : 'added'}.`)
    } else {
      dispatch({ type: 'value', cell: selectedCell, value })
      setMessage(`Entered ${value} in row ${Math.floor(selectedCell / 9) + 1}, column ${selectedCell % 9 + 1}.`)
    }
    setHintCell(null)
  }

  const eraseSelected = () => {
    if (!puzzle || puzzle.givens[selectedCell] !== 0) {
      setMessage('Given numbers cannot be changed.')
      return
    }
    dispatch({ type: 'erase', cell: selectedCell })
    setHintCell(null)
    setMessage(`Cleared row ${Math.floor(selectedCell / 9) + 1}, column ${selectedCell % 9 + 1}.`)
  }

  const requestHint = () => {
    const next = fillHint(state)
    if (next === state) {
      setMessage('There are no empty cells to fill.')
      return
    }
    const hinted = next.lastHintedCell
    dispatch({ type: 'hint' })
    setHintCell(hinted)
    if (hinted !== null) setMessage(`A hint was filled in row ${Math.floor(hinted / 9) + 1}, column ${hinted % 9 + 1}.`)
  }

  const startNewPuzzle = (difficulty = newDifficulty) => {
    const nextPuzzle = getPuzzleForNewGame(difficulty, state.puzzleId)
    const nextSession = { sessionId: createSessionId(), createdAt: new Date().toISOString() }
    session.current = nextSession
    persistenceQueue.current = persistenceQueue.current.then(async () => { await recordGameStarted('sudoku') })
    dispatch({ type: 'new', state: createSudokuState(nextPuzzle.id, state.showMistakes) })
    setSelectedCell(nextPuzzle.givens.findIndex((value) => value === 0))
    setHintCell(null)
    setMessage('')
    setNotesMode(false)
    setShowNewPuzzle(false)
  }

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const row = Math.floor(selectedCell / 9)
    const column = selectedCell % 9
    const arrows: Record<string, [number, number]> = {
      ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
    }
    const delta = arrows[event.key]
    if (delta) {
      event.preventDefault()
      const nextRow = Math.max(0, Math.min(8, row + delta[0]))
      const nextColumn = Math.max(0, Math.min(8, column + delta[1]))
      moveFocusAfterSelection.current = true
      setSelectedCell(nextRow * 9 + nextColumn)
      return
    }
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault()
      updateCell(Number(event.key))
      return
    }
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault()
      eraseSelected()
    }
  }

  if (!ready || !puzzle) return <div role="status" aria-live="polite" className="zen-game-message">Loading Sudoku…</div>

  const selectedRow = Math.floor(selectedCell / 9)
  const selectedColumn = selectedCell % 9
  const matchedValue = state.values[selectedCell]
  const onWrong = (index: number): boolean => state.showMistakes && state.values[index] !== 0
    && (conflicts.has(index) || state.values[index] !== puzzle.solution[index])

  return (
    <div className={`flex flex-col gap-3 ${settings.reducedMotion ? 'motion-reduce' : ''}`}>
      <GameToolbar>
        <button type="button" onClick={() => { setNewDifficulty(state.difficulty); setShowNewPuzzle(true) }} className="zen-game-button">New Puzzle</button>
        <button type="button" onClick={() => { dispatch({ type: 'undo' }); setHintCell(null); setMessage('Undid the last change.') }} disabled={state.history.length === 0} className="zen-game-button">Undo</button>
        <button type="button" onClick={requestHint} className="zen-game-button">Hint</button>
        <button type="button" onClick={() => setShowRules(true)} className="zen-game-button">Rules</button>
        {!settings.calmStats ? <span className="ml-auto text-lg font-semibold">{difficultyName(state.difficulty)}</span> : null}
      </GameToolbar>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,40rem)_minmax(15rem,1fr)] lg:items-start">
        <div className={`min-w-0 order-1 ${settings.handedness === 'left' ? 'lg:order-2' : 'lg:order-1'}`}>
          <div
            role="grid"
            aria-label={`${difficultyName(state.difficulty)} Sudoku puzzle`}
            onKeyDown={onGridKeyDown}
            className={`sudoku-board mx-auto flex aspect-square w-full max-w-[40rem] flex-col border-2 border-zinc-900 bg-[#fffdf7] text-zinc-950 dark:border-zinc-100 dark:bg-zinc-950 dark:text-zinc-50 ${settings.gamePieceScale === 'large' ? 'sudoku-board--large' : ''}`}
          >
            {Array.from({ length: 9 }, (_, row) => (
              <div role="row" key={`row-${row}`} className="grid min-h-0 flex-1 grid-cols-9">
                {Array.from({ length: 9 }, (_, column) => {
                  const index = row * 9 + column
                  const value = state.values[index]
                  const given = puzzle.givens[index] !== 0
                  const selected = index === selectedCell
                  const related = row === selectedRow || column === selectedColumn
                    || Math.floor(row / 3) === Math.floor(selectedRow / 3) && Math.floor(column / 3) === Math.floor(selectedColumn / 3)
                  const matching = matchedValue !== 0 && value === matchedValue
                  const classes = [
                    'sudoku-cell relative flex min-h-0 min-w-0 items-center justify-center border-b border-r border-zinc-400 p-0 text-[clamp(0.8rem,4.4vw,1.7rem)] leading-none focus-visible:z-10',
                    column % 3 === 2 && column < 8 ? 'border-r-[3px] border-r-zinc-900 dark:border-r-zinc-100' : '',
                    row % 3 === 2 && row < 8 ? 'border-b-[3px] border-b-zinc-900 dark:border-b-zinc-100' : '',
                    given ? 'font-extrabold' : 'font-medium',
                    related ? 'sudoku-related-cell' : 'bg-[#fffdf7] dark:bg-zinc-950',
                    matching ? 'sudoku-matching-value' : '',
                    onWrong(index) ? 'sudoku-mistake' : '',
                    selected ? 'sudoku-selected-cell z-[1]' : '',
                    hintCell === index ? 'sudoku-hinted-cell' : '',
                  ].filter(Boolean).join(' ')
                  const description = cellDescription(state, index, conflicts, hintCell)
                  return (
                    <button
                      key={index}
                      ref={(element) => { cellRefs.current[index] = element }}
                      type="button"
                      role="gridcell"
                      aria-label={description}
                      aria-selected={selected}
                      tabIndex={selected ? 0 : -1}
                      className={classes}
                      onClick={() => setSelectedCell(index)}
                    >
                      {value !== 0 ? value : state.notes[index].length > 0 ? (
                        <span aria-hidden="true" className={`sudoku-notes grid h-full w-full grid-cols-3 grid-rows-3 items-center justify-items-center text-[0.55rem] leading-none sm:text-xs ${settings.gamePieceScale === 'large' ? 'sudoku-notes--large' : ''}`}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => <span key={digit}>{state.notes[index].includes(digit) ? digit : ''}</span>)}
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          <p className="mt-2 min-h-7 text-base" role="status" aria-live="polite">{message}</p>
        </div>

        <section className={`space-y-3 order-2 ${settings.handedness === 'left' ? 'lg:order-1' : 'lg:order-2'}`} aria-label="Sudoku controls">
          <p className="text-lg font-semibold">Selected: row {selectedRow + 1}, column {selectedColumn + 1}</p>
          <div className={`grid grid-cols-3 gap-2 ${settings.gamePieceScale === 'large' ? 'sudoku-number-pad--large' : ''}`} role="group" aria-label="Number pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button key={digit} type="button" onClick={() => updateCell(digit)} className="zen-game-button sudoku-number-button" aria-label={`${notesMode ? 'Toggle note' : 'Enter'} ${digit}`}>{digit}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setNotesMode((active) => !active)} aria-pressed={notesMode} className={`zen-game-button ${notesMode ? 'sudoku-mode-on' : ''}`}>Notes{notesMode ? ' on' : ''}</button>
            <button type="button" onClick={eraseSelected} className="zen-game-button">Erase</button>
          </div>
          <button type="button" onClick={() => dispatch({ type: 'show-mistakes', value: !state.showMistakes })} aria-pressed={state.showMistakes} className="zen-game-button w-full">Show mistakes: {state.showMistakes ? 'On' : 'Off'}</button>
          <p className="text-base">Tap an editable square, then choose a number. Arrow keys move between squares; number keys enter values.</p>
        </section>
      </div>

      {showNewPuzzle ? (
        <GameDialog title="New Sudoku puzzle" description="Choose a difficulty. Your current puzzle stays available until you start the new one." onDismiss={() => setShowNewPuzzle(false)}>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto">
            <section className="space-y-2">
              <h3 className="font-bold">Difficulty</h3>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((difficulty) => (
                  <button key={difficulty} type="button" onClick={() => setNewDifficulty(difficulty)} aria-pressed={newDifficulty === difficulty} className={`zen-game-button ${newDifficulty === difficulty ? 'sudoku-mode-on' : ''}`}>{difficultyName(difficulty)}</button>
                ))}
              </div>
              <p>Changing this choice keeps your current puzzle. Your current puzzle is replaced only when you start the new one.</p>
            </section>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setShowNewPuzzle(false)} className="zen-game-button">Keep current puzzle</button>
            <button type="button" onClick={() => startNewPuzzle()} className="zen-game-button">Start new puzzle</button>
          </div>
        </GameDialog>
      ) : null}

      {showRules ? (
        <GameDialog title="How to play Sudoku" description="Fill the grid so every row, column, and 3 × 3 box contains each number from 1 to 9 once." onDismiss={() => setShowRules(false)}>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            <p>Select an empty square, then tap a number or press its number key. Arrow keys move the selection. Given numbers are fixed.</p>
            <p>Turn on Notes to toggle small candidate numbers in a square. Erase clears your entry or notes. Undo reverses your last change.</p>
            <p>Hint fills one unsolved square. Show mistakes is optional and can highlight incorrect entries.</p>
            <section aria-label="Sudoku statistics">
              <h3 className="font-bold">Statistics</h3>
              {statistics ? <p>{statistics.gamesStarted} puzzles started · {statistics.gamesCompleted} completed · Easy {statistics.completionBreakdown.easy ?? 0}, Medium {statistics.completionBreakdown.medium ?? 0}, Hard {statistics.completionBreakdown.hard ?? 0}</p> : <p>Statistics are stored on this device.</p>}
            </section>
          </div>
          <button type="button" onClick={() => setShowRules(false)} className="zen-game-button">Close rules</button>
        </GameDialog>
      ) : null}

      {complete ? (
        <GameDialog title="You did it." description="The Sudoku puzzle is complete." >
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => startNewPuzzle(state.difficulty)} className="zen-game-button">New Puzzle</button>
            <button type="button" onClick={onBack} className="zen-game-button">Back to Games</button>
          </div>
        </GameDialog>
      ) : null}
    </div>
  )
}
