import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { AppSettings } from '../../../lib/settings'
import { createSessionId, deleteActiveSave, saveActiveGame } from '../../../persistence/gameSave'
import { readStatistics, recordGameCompleted, recordGameStarted } from '../../../persistence/statistics'
import type { GameStatistics } from '../../../persistence/types'
import { GameDialog } from '../../../components/GameDialog'
import { GameToolbar } from '../../../components/GameToolbar'
import { createWordSearchState, getWordPath, getWordSearchHint, isWordSearchComplete, selectWord } from '../model/engine'
import { WORD_SEARCH_PUZZLES, findWordSearchPuzzle } from '../model/puzzles'
import { restoreWordSearchState, serializeWordSearchState } from '../model/persistence'
import type { WordSearchCell, WordSearchPuzzle, WordSearchState } from '../model/types'
import { loadWordSearchSave } from '../save'

type Props = { settings: AppSettings; onBack: () => void; onSaveAvailabilityChange: (hasSave: boolean) => void }
const initialPuzzle = WORD_SEARCH_PUZZLES[0]
const sameCell = (a: WordSearchCell | null, b: WordSearchCell) => Boolean(a && a.row === b.row && a.column === b.column)

export const WordSearchScreen = ({ settings, onBack, onSaveAvailabilityChange }: Props) => {
  const [puzzle, setPuzzle] = useState<WordSearchPuzzle>(initialPuzzle)
  const [state, setState] = useState<WordSearchState>(() => createWordSearchState(initialPuzzle.id))
  const [ready, setReady] = useState(false)
  const [start, setStart] = useState<WordSearchCell | null>(null)
  const [end, setEnd] = useState<WordSearchCell | null>(null)
  const [hint, setHint] = useState<WordSearchCell | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [message, setMessage] = useState('Choose a first letter, then an end letter. You can also drag across a word.')
  const [showNewPuzzle, setShowNewPuzzle] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [statistics, setStatistics] = useState<GameStatistics | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const pointerStart = useRef<WordSearchCell | null>(null)
  const pointerId = useRef<number | null>(null)
  const pointerMoved = useRef(false)
  const pointerClick = useRef(false)
  const session = useRef<{ sessionId: string; createdAt: string } | null>(null)
  const completionRecorded = useRef(false)
  const persistenceQueue = useRef<Promise<void>>(Promise.resolve())
  const hintTimer = useRef<number | null>(null)
  const selection = getWordPath(start ?? { row: -99, column: -99 }, end ?? { row: -98, column: -98 }) ?? []
  const selectedCells = selection.length ? selection : start ? [start] : []
  const complete = isWordSearchComplete(puzzle, state)
  const foundCells = new Set(puzzle.words.filter(({ word }) => state.foundWords.includes(word)).flatMap(({ cells }) => cells.map(({ row, column }) => row * puzzle.grid.length + column)))

  useEffect(() => {
    let mounted = true
    void (async () => {
      const save = await loadWordSearchSave()
      const restored = save ? restoreWordSearchState(save.state) : null
      if (!mounted) return
      if (save && restored) {
        const restoredPuzzle = findWordSearchPuzzle(restored.puzzleId)
        if (restoredPuzzle) {
          setPuzzle(restoredPuzzle)
          setState(restored)
          session.current = { sessionId: save.sessionId, createdAt: save.createdAt }
          completionRecorded.current = isWordSearchComplete(restoredPuzzle, restored)
          if (completionRecorded.current) setShowCompletion(true)
        }
      } else {
        session.current = { sessionId: createSessionId(), createdAt: new Date().toISOString() }
        await recordGameStarted('word-search')
      }
      if (mounted) setReady(true)
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!ready || !session.current) return
    const snapshot = serializeWordSearchState(state)
    const currentSession = session.current
    persistenceQueue.current = persistenceQueue.current.then(async () => {
      if (isWordSearchComplete(puzzle, snapshot)) {
        if (!completionRecorded.current) {
          completionRecorded.current = true
          const recorded = await recordGameCompleted('word-search', currentSession.sessionId, snapshot.foundWords.length, undefined, puzzle.theme)
          if (recorded) await deleteActiveSave('word-search')
          onSaveAvailabilityChange(false)
        }
        return
      }
      if (await saveActiveGame('word-search', snapshot, currentSession)) onSaveAvailabilityChange(true)
    })
  }, [onSaveAvailabilityChange, puzzle, ready, state])

  useEffect(() => {
    if (showRules) void readStatistics('word-search').then(setStatistics)
  }, [showRules])
  useEffect(() => () => { if (hintTimer.current !== null) window.clearTimeout(hintTimer.current) }, [])

  const submitSelection = (first: WordSearchCell, last: WordSearchCell) => {
    const result = selectWord(puzzle, state, first, last)
    setStart(null); setEnd(null); setHint(null)
    if (result.result === 'invalid') setMessage('Those letters do not make a listed word. Try another selection.')
    else if (result.result === 'already-found') setMessage(`${result.word} has already been found.`)
    else {
      setState(result.state)
      setMessage(result.result === 'complete' ? `Found ${result.word}. You did it.` : `Found ${result.word}.`)
      if (result.result === 'complete') setShowCompletion(true)
    }
  }

  const chooseCell = (cell: WordSearchCell) => {
    setHint(null)
    if (!start) {
      setStart(cell); setEnd(cell); setMessage(`First letter: row ${cell.row + 1}, column ${cell.column + 1}. Choose the last letter.`)
    } else submitSelection(start, cell)
  }

  const cellFromPoint = (event: PointerEvent | ReactPointerEvent<HTMLDivElement>): WordSearchCell | null => {
    const point = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-word-cell]')
    if (!point) return null
    const index = Number(point.dataset.wordCell)
    return Number.isInteger(index) ? { row: Math.floor(index / puzzle.grid.length), column: index % puzzle.grid.length } : null
  }

  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const cell = cellFromPoint(event)
    if (!cell || event.button !== 0) return
    pointerStart.current = cell; pointerId.current = event.pointerId; pointerMoved.current = false
  }
  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== event.pointerId || !pointerStart.current) return
    const cell = cellFromPoint(event)
    if (cell) {
      if (!sameCell(pointerStart.current, cell)) {
        pointerMoved.current = true
        setStart(pointerStart.current); setEnd(cell); setHint(null)
      }
    }
  }
  const pointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== event.pointerId || !pointerStart.current) return
    const first = pointerStart.current
    const last = cellFromPoint(event) ?? end ?? first
    const wasDrag = pointerMoved.current && !sameCell(first, last)
    pointerStart.current = null; pointerId.current = null
    pointerMoved.current = false
    if (wasDrag) {
      pointerClick.current = true
      submitSelection(first, last)
      window.setTimeout(() => { pointerClick.current = false }, 0)
    }
  }
  const cancelPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== event.pointerId) return
    pointerStart.current = null; pointerId.current = null; pointerMoved.current = false
    setStart(null); setEnd(null)
  }
  const onCellClick = (cell: WordSearchCell) => {
    if (pointerClick.current) { pointerClick.current = false; return }
    chooseCell(cell)
  }

  const startNewPuzzle = (nextPuzzle: WordSearchPuzzle) => {
    if (hintTimer.current !== null) window.clearTimeout(hintTimer.current)
    setHint(null); setStart(null); setEnd(null); setShowNewPuzzle(false); setShowCompletion(false)
    const nextSession = { sessionId: createSessionId(), createdAt: new Date().toISOString() }
    session.current = nextSession; completionRecorded.current = false
    setPuzzle(nextPuzzle); setState(createWordSearchState(nextPuzzle.id)); setMessage('Choose a first letter, then an end letter. You can also drag across a word.')
    persistenceQueue.current = persistenceQueue.current.then(() => recordGameStarted('word-search').then(() => undefined))
  }

  const requestHint = () => {
    const cell = getWordSearchHint(puzzle, state)
    if (!cell) { setMessage('Every word has been found.'); return }
    if (hintTimer.current !== null) window.clearTimeout(hintTimer.current)
    setHint(cell); setFocusedIndex(cell.row * puzzle.grid.length + cell.column)
    setMessage(`Hint: start at row ${cell.row + 1}, column ${cell.column + 1}. The first letter is ${puzzle.grid[cell.row][cell.column]}.`)
    hintTimer.current = window.setTimeout(() => setHint(null), 2200)
  }

  const onCellKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const row = Math.floor(index / puzzle.grid.length); const column = index % puzzle.grid.length
    const offsets: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
    if (offsets[event.key]) {
      event.preventDefault()
      const [dr, dc] = offsets[event.key]
      const nextRow = Math.max(0, Math.min(puzzle.grid.length - 1, row + dr)); const nextColumn = Math.max(0, Math.min(puzzle.grid.length - 1, column + dc))
      const nextIndex = nextRow * puzzle.grid.length + nextColumn
      setFocusedIndex(nextIndex); gridRef.current?.querySelectorAll<HTMLButtonElement>('[data-word-cell]')[nextIndex]?.focus()
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); chooseCell({ row, column })
    } else if (event.key === 'Escape') { setStart(null); setEnd(null); setMessage('Selection cleared.') }
  }

  if (!ready) return <div role="status" aria-live="polite" className="zen-game-message">Loading Word Search…</div>
  const hasProgress = !complete && state.foundWords.length > 0
  const gridLarge = settings.gamePieceScale === 'large' || settings.simpleMode

  return <div className="word-search-screen -mx-4 space-y-3 sm:mx-0">
    <GameToolbar>
      <button type="button" onClick={() => setShowNewPuzzle(true)} className="zen-game-button">New Puzzle</button>
      <button type="button" onClick={requestHint} disabled={complete} className="zen-game-button">Hint</button>
      <button type="button" onClick={() => setShowRules(true)} className="zen-game-button">Rules</button>
      <span className="ml-auto text-lg font-semibold">{state.foundWords.length} of {puzzle.words.length} found</span>
    </GameToolbar>
    <div className="word-search-layout">
      <section className="word-search-paper" aria-label={`${puzzle.theme} word search puzzle`}>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-bold">{puzzle.theme}</h2>
          <span className="text-base">Find each word</span>
        </div>
        <div ref={gridRef} role="group" aria-label={`${puzzle.theme} letter grid`} className={`word-search-grid ${gridLarge ? 'word-search-grid--large' : ''}`} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={cancelPointer}>
          {puzzle.grid.flatMap((row, rowIndex) => row.map((letter, columnIndex) => {
            const index = rowIndex * puzzle.grid.length + columnIndex
            const cell = { row: rowIndex, column: columnIndex }
            const selected = selectedCells.some((item) => sameCell(item, cell))
            const endpoint = sameCell(start, cell) || sameCell(end, cell)
            return <button key={index} type="button" data-word-cell={index} tabIndex={focusedIndex === index ? 0 : -1}
              aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}, letter ${letter}${foundCells.has(index) ? ', part of a found word' : ''}${selected ? ', selected' : ''}`}
              className={`word-search-cell ${foundCells.has(index) ? 'word-search-cell--found' : ''} ${selected ? 'word-search-cell--selected' : ''} ${endpoint ? 'word-search-cell--endpoint' : ''} ${sameCell(hint, cell) ? 'word-search-cell--hint' : ''}`}
              onClick={() => onCellClick(cell)} onKeyDown={(event) => onCellKeyDown(event, index)} onFocus={() => setFocusedIndex(index)}>
              <span>{letter}</span>
            </button>
          }))}
        </div>
        <p className="mt-2 min-h-7 text-base" role="status" aria-live="polite" aria-atomic="true">{message}</p>
      </section>
      <section className="word-search-words" aria-label="Words to find">
        <h2 className="mb-2 text-xl font-bold">Words to find</h2>
        <ul className="word-search-word-list">
          {puzzle.words.map(({ word }) => <li key={word} className={state.foundWords.includes(word) ? 'word-search-word--found' : ''}>
            <span aria-hidden="true">{state.foundWords.includes(word) ? '✓' : '○'}</span><span>{word}</span>{state.foundWords.includes(word) ? <span className="sr-only">found</span> : null}
          </li>)}
        </ul>
      </section>
    </div>

    {showNewPuzzle ? <GameDialog title="New Word Search puzzle" description={hasProgress ? 'Starting another puzzle replaces your unfinished progress. Choose a puzzle to continue.' : 'Choose a theme and puzzle.'} onDismiss={() => setShowNewPuzzle(false)}>
      <div className="max-h-[55vh] space-y-2 overflow-y-auto" role="group" aria-label="Available puzzles">
        {WORD_SEARCH_PUZZLES.map((item) => <button key={item.id} type="button" className="word-search-puzzle-choice" onClick={() => startNewPuzzle(item)}>{item.theme} · Puzzle {item.id.endsWith('1') ? '1' : '2'}{item.id === puzzle.id ? ' · Current' : ''}</button>)}
      </div>
      <button type="button" onClick={() => setShowNewPuzzle(false)} className="zen-game-button">Keep current puzzle</button>
    </GameDialog> : null}
    {showRules ? <GameDialog title="How to play Word Search" description="Find each listed word in the letter grid. Words run in a straight line horizontally, vertically, or diagonally. Some run backwards." onDismiss={() => setShowRules(false)}>
      <div className="max-h-[60vh] space-y-3 overflow-y-auto text-lg"><p>Tap a first letter, then tap the last letter. Or press and drag across a word. Press Escape to clear a selection.</p><p>Use arrow keys to move around the grid. Press Enter or Space to choose a first or last letter. Hint gives you the first letter of an unfound word.</p><section aria-label="Word Search statistics"><h3 className="font-bold">Statistics</h3>{statistics ? <p>{statistics.gamesStarted} puzzles started · {statistics.gamesCompleted} completed across {Object.keys(statistics.completionBreakdown).length} themes.</p> : <p>Statistics are stored on this device.</p>}</section></div>
      <button type="button" onClick={() => setShowRules(false)} className="zen-game-button">Close rules</button>
    </GameDialog> : null}
    {complete && showCompletion && !showNewPuzzle ? <GameDialog title="You did it." description={`You found every word in ${puzzle.theme}.`}><div className="flex flex-wrap gap-3"><button type="button" onClick={() => setShowNewPuzzle(true)} className="zen-game-button">New Puzzle</button><button type="button" onClick={onBack} className="zen-game-button">Back to Games</button></div></GameDialog> : null}
  </div>
}

