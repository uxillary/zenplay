import { isValidMove } from '../model/rules.ts'
import type { Location, Move, SolitaireState } from '../model/types.ts'

export const DRAG_THRESHOLD = 7

export const canStartDragPointer = (pointerType: string, button: number): boolean =>
  pointerType !== 'mouse' || button === 0

export const crossedDragThreshold = (startX: number, startY: number, x: number, y: number): boolean =>
  Math.hypot(x - startX, y - startY) >= DRAG_THRESHOLD

export const shouldSuppressDraggedClick = (detail: number, suppressNextClick: boolean): boolean =>
  detail !== 0 && suppressNextClick

export const legalDropMove = (state: SolitaireState, from: Location, cardId: string, to: Location | null): Move | null => {
  if (!to) return null
  const move = { from, to, cardId }
  return isValidMove(state, move) ? move : null
}
