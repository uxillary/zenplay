import test from 'node:test'
import assert from 'node:assert/strict'
import { restoreWordSearchState, serializeWordSearchState, isWordSearchState } from './persistence.ts'
import { WORD_SEARCH_PUZZLES } from './puzzles.ts'

test('word-search states serialize and restore without sharing found-word arrays', () => {
  const state = { puzzleId: WORD_SEARCH_PUZZLES[0].id, foundWords: [WORD_SEARCH_PUZZLES[0].words[0].word] }
  const serialized = serializeWordSearchState(state)
  const restored = restoreWordSearchState(serialized)
  assert.deepEqual(restored, state)
  assert.notEqual(restored?.foundWords, state.foundWords)
})

test('unknown puzzle IDs and invalid found-word lists are rejected', () => {
  const id = WORD_SEARCH_PUZZLES[0].id
  assert.equal(isWordSearchState({ puzzleId: 'unknown', foundWords: [] }), false)
  assert.equal(isWordSearchState({ puzzleId: id, foundWords: ['NOT A WORD'] }), false)
  assert.equal(isWordSearchState({ puzzleId: id, foundWords: [WORD_SEARCH_PUZZLES[0].words[0].word, WORD_SEARCH_PUZZLES[0].words[0].word] }), false)
  assert.equal(restoreWordSearchState({ puzzleId: id, foundWords: [12] }), null)
})

