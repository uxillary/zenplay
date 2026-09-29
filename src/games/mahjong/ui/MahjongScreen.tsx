import { useEffect, useRef, useState } from 'react'
import type { AppSettings } from '../../../lib/settings'
import { GameDialog } from '../../../components/GameDialog'
import { GameToolbar } from '../../../components/GameToolbar'
import { createSessionId, deleteActiveSave, saveActiveGame } from '../../../persistence/gameSave'
import { recordGameCompleted, recordGameStarted } from '../../../persistence/statistics'
import { applyMahjongHint, createMahjongState, getAvailableMahjongPairs, getMahjongTilePosition, isMahjongComplete, isMahjongTileFree, removeMahjongPair, undoMahjong } from '../model/engine'
import { restoreMahjongState, serializeMahjongState } from '../model/persistence'
import type { MahjongState, MahjongTile } from '../model/types'
import { loadMahjongSave } from '../save'
import { MahjongTileFace } from './MahjongTileFace'
import { getMahjongAccessibleName } from './mahjongFaceData'

type Props = { settings: AppSettings; onSaveAvailabilityChange: (hasSave: boolean) => void; onSaveFailure: () => void }

export const MahjongScreen = ({ settings, onSaveAvailabilityChange, onSaveFailure }: Props) => {
  const [state, setState] = useState<MahjongState>(() => createMahjongState())
  const [ready, setReady] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [hinted, setHinted] = useState<string[]>([])
  const [showNew, setShowNew] = useState(false)
  const [announcement, setAnnouncement] = useState('Select any free tile to begin.')
  const [focusId, setFocusId] = useState<string | null>(null)
  const [showWin, setShowWin] = useState(false)
  const session = useRef<{ sessionId: string; createdAt: string } | null>(null)
  const queue = useRef<Promise<void>>(Promise.resolve())
  const hintTimer = useRef<number | null>(null)
  const complete = isMahjongComplete(state)
  const pairs = getAvailableMahjongPairs(state)
  const focusTileId = focusId && state.tiles.some((tile) => tile.id === focusId && !tile.removed && isMahjongTileFree(tile, state.tiles))
    ? focusId
    : state.tiles.find((tile) => isMahjongTileFree(tile, state.tiles))?.id ?? null

  useEffect(() => {
    if (focusId) document.getElementById(`mahjong-${focusId}`)?.focus()
  }, [focusId])

  useEffect(() => {
    let mounted = true
    void (async () => {
      const save = await loadMahjongSave()
      if (!mounted) return
      const restored = save ? restoreMahjongState(save.state) : null
      if (save && restored) {
        session.current = { sessionId: save.sessionId, createdAt: save.createdAt }
        setState(restored)
      } else {
        session.current = { sessionId: createSessionId(), createdAt: new Date().toISOString() }
        await recordGameStarted('mahjong')
      }
      setReady(true)
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!ready || !session.current) return
    const snapshot = serializeMahjongState(state)
    const current = session.current
    queue.current = queue.current.then(async () => {
      if (isMahjongComplete(snapshot)) {
        const recorded = await recordGameCompleted('mahjong', current.sessionId, snapshot.moves)
        if (recorded) await deleteActiveSave('mahjong')
        onSaveAvailabilityChange(false)
      } else if (await saveActiveGame('mahjong', snapshot, current)) onSaveAvailabilityChange(true)
      else onSaveFailure()
    })
  }, [onSaveAvailabilityChange, onSaveFailure, ready, state])

  useEffect(() => () => { if (hintTimer.current !== null) window.clearTimeout(hintTimer.current) }, [])

  const startNew = () => {
    session.current = { sessionId: createSessionId(), createdAt: new Date().toISOString() }
    const next = { ...createMahjongState(), accessibleLabels: state.accessibleLabels }
    setState(next); setSelected(null); setHinted([]); setShowWin(false); setShowNew(false)
    const firstFreeTile = next.tiles.find((tile) => isMahjongTileFree(tile, next.tiles))
    setFocusId(firstFreeTile?.id ?? null)
    if (firstFreeTile) window.requestAnimationFrame(() => document.getElementById(`mahjong-${firstFreeTile.id}`)?.focus())
    setAnnouncement('New Turtle board. Select any free tile to begin.')
    queue.current = queue.current.then(async () => { await recordGameStarted('mahjong') })
  }
  const chooseTile = (tile: MahjongTile) => {
    if (!isMahjongTileFree(tile, state.tiles)) return
    setHinted([])
    if (!selected) { setSelected(tile.id); setAnnouncement(`${getMahjongAccessibleName(tile)} selected. Choose a matching free tile.`); return }
    if (selected === tile.id) { setSelected(null); setAnnouncement('Selection cleared.'); return }
    const first = state.tiles.find((candidate) => candidate.id === selected)
    if (first && first.matchKey === tile.matchKey) {
      const next = removeMahjongPair(state, first.id, tile.id)
      setState(next); setSelected(null)
      const nextFocus = next.tiles.find((item) => isMahjongTileFree(item, next.tiles))
      setFocusId(nextFocus?.id ?? null)
      const earned = next.rewardedLayers.length - state.rewardedLayers.length
      const rewardMessage = earned === 1 ? 'Layer cleared. One free Hint earned.' : earned > 1 ? `Layers cleared. ${earned} free Hints earned.` : ''
      if (isMahjongComplete(next)) { setAnnouncement(rewardMessage ? `Board cleared. ${rewardMessage}` : 'Board cleared. You did it.'); setShowWin(true) }
      else setAnnouncement(rewardMessage || `${getMahjongAccessibleName(first)} pair removed. ${next.tiles.filter((item) => !item.removed).length} tiles remain.`)
    } else {
      setSelected(tile.id)
      setAnnouncement(`${getMahjongAccessibleName(tile)} selected. Choose a matching free tile.`)
    }
  }
  const requestHint = () => {
    if (hintTimer.current !== null) window.clearTimeout(hintTimer.current)
    const result = applyMahjongHint(state)
    const pair = result.pair
    if (!pair) { setAnnouncement(complete ? 'Every tile has been removed.' : 'No available matches. Undo a pair or start a new game.'); return }
    setState(result.state)
    setSelected(null); setHinted(pair); setAnnouncement('Hint: two highlighted tiles match.');
    hintTimer.current = window.setTimeout(() => { setHinted([]); hintTimer.current = null }, settings.reducedMotion ? 2000 : 3000)
  }
  const undo = () => {
    if (!state.removedPairs.length) return
    const pair = state.removedPairs.at(-1)
    const next = undoMahjong(state)
    setState(next); setSelected(null); setShowWin(false); setFocusId(pair?.[0] ?? null); setAnnouncement('Last pair restored.')
  }
  const onBoardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    const current = state.tiles.find((tile) => tile.id === focusId)
    const candidates = state.tiles.filter((tile) => !tile.removed && isMahjongTileFree(tile, state.tiles))
    if (!candidates.length) return
    const origin = current ?? candidates[0]
    const direction = event.key === 'ArrowLeft' ? [-1, 0] : event.key === 'ArrowRight' ? [1, 0] : event.key === 'ArrowUp' ? [0, -1] : [0, 1]
    const next = candidates.filter((tile) => (tile.x - origin.x) * direction[0] + (tile.y - origin.y) * direction[1] > 0)
      .sort((a, b) => Math.hypot(a.x - origin.x, a.y - origin.y) - Math.hypot(b.x - origin.x, b.y - origin.y))[0]
    const destination = next ?? candidates[0]
    setFocusId(destination.id)
    document.getElementById(`mahjong-${destination.id}`)?.focus()
  }

  if (!ready) return <p role="status">Loading Mahjong…</p>
  return <div className={`mahjong-screen space-y-3 ${settings.reducedMotion ? 'mahjong-reduced-motion' : ''}`}>
    <GameToolbar>
      <button type="button" onClick={() => state.moves ? setShowNew(true) : startNew()} className="zen-game-button">New Game</button>
      <button type="button" onClick={undo} disabled={!state.removedPairs.length} className="zen-game-button">Undo</button>
      <button type="button" onClick={requestHint} disabled={complete} className="zen-game-button"
        aria-label={state.freeHints ? `Hint, ${state.freeHints} free ${state.freeHints === 1 ? 'hint' : 'hints'} available` : 'Hint'}>
        {state.freeHints ? `Hint · ${state.freeHints} free` : 'Hint'}
      </button>
      <label className="mahjong-accessible-toggle"><input type="checkbox" checked={state.accessibleLabels} onChange={(event) => setState((current) => ({ ...current, accessibleLabels: event.target.checked }))} /> Tile labels</label>
      {!settings.calmStats ? <span className="ml-auto text-base font-semibold">Pairs: {state.moves}</span> : null}
    </GameToolbar>
    <div className="flex flex-wrap justify-between gap-2 text-base" aria-label="Board status">
      <span>{state.tiles.filter((tile) => !tile.removed).length} tiles remaining</span><span>{pairs.length} available matches</span>
    </div>
    <div className="mahjong-table">
      <div className="mahjong-board" role="group" aria-label="Classic Turtle Mahjong board" onKeyDown={onBoardKeyDown}>
        {state.tiles.map((tile) => {
          if (tile.removed) return null
          const free = isMahjongTileFree(tile, state.tiles)
          const isSelected = selected === tile.id
          const isHinted = hinted.includes(tile.id)
          const label = `${getMahjongAccessibleName(tile)}, ${free ? 'free' : 'blocked'}${isSelected ? ', selected' : ''}`
          const position = getMahjongTilePosition(tile)
          return <button id={`mahjong-${tile.id}`} key={tile.id} type="button" tabIndex={free && focusTileId === tile.id ? 0 : -1}
            className={`mahjong-tile ${free ? 'mahjong-tile--free' : 'mahjong-tile--blocked'} ${isSelected ? 'mahjong-tile--selected' : ''} ${isHinted ? 'mahjong-tile--hinted' : ''} mahjong-family--${tile.family}`}
            style={{ left: `${(position.x + 3) / 18 * 100}%`, top: `${(position.y + 0.5) / 9 * 100}%`, zIndex: tile.z * 2 + 1 }}
            aria-label={label} aria-pressed={isSelected} aria-disabled={!free} onFocus={() => setFocusId(tile.id)} onClick={() => chooseTile(tile)}>
            <MahjongTileFace tile={tile} labels={state.accessibleLabels} />
            <span className="sr-only">{label}</span>
          </button>
        })}
      </div>
    </div>
    <p role="status" aria-live="polite" aria-atomic="true" className="min-h-6">{announcement}</p>
    {!pairs.length && !complete ? <div className="mahjong-no-moves" role="status"><p>No available matches. You can undo a pair or start a new game.</p><button type="button" onClick={undo} disabled={!state.removedPairs.length} className="zen-game-button">Undo</button><button type="button" onClick={startNew} className="zen-game-button">New Game</button></div> : null}
    {showNew ? <GameDialog title="Start a new Mahjong game?" description="Your current board will be replaced." onDismiss={() => setShowNew(false)}><div className="flex gap-3"><button type="button" className="zen-game-button" onClick={() => setShowNew(false)}>Keep current game</button><button type="button" className="zen-game-button" onClick={startNew}>Start new game</button></div></GameDialog> : null}
    {showWin ? <GameDialog title="Board cleared" description={`You removed all 144 tiles in ${state.moves} pairs.`}><div className="flex gap-3"><button type="button" className="zen-game-button" onClick={startNew}>New Game</button><button type="button" className="zen-game-button" onClick={() => setShowWin(false)}>Close</button></div></GameDialog> : null}
  </div>
}
