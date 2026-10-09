import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { COUNTRIES, FLAG_REGIONS, getCountriesForRegion } from './countries.ts'
import { checkFlagAnswer, continueFlagsPractice, continueFlagsRound, createFlagRound, createFlagsGameState, createFlagsPracticeState, getReverseFlagOptionStatus, ROUND_LENGTH, submitFlagsAnswer, submitFlagsPracticeAnswer } from './engine.ts'

const seeded = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}

test('uses a documented-size ISO country dataset with unique stable ids and stable local SVG mappings', () => {
  assert.equal(COUNTRIES.length, 195)
  assert.equal(new Set(COUNTRIES.map(({ id }) => id)).size, 195)
  assert.ok(COUNTRIES.every(({ id, flag }) => flag === `/flags/${id}.svg`))
})

test('every country maps to one valid, self-contained SVG with no extra flag assets', () => {
  const assetDirectory = fileURLToPath(new URL('../../../../public/flags/', import.meta.url))
  const svgNames = readdirSync(assetDirectory).filter((name) => name.endsWith('.svg')).sort()
  const expectedNames = COUNTRIES.map(({ id }) => `${id}.svg`).sort()
  const aspectRatios = new Set<number>()
  assert.deepEqual(svgNames, expectedNames)

  for (const country of COUNTRIES) {
    const source = readFileSync(`${assetDirectory}/${country.id}.svg`, 'utf8')
    const viewBox = source.match(/^<svg\b[^>]*\bviewBox="([^"]+)"/i)?.[1]
    assert.ok(viewBox, `${country.id} needs an SVG root and intrinsic viewBox`)
    const [, minX, minY, width, height] = viewBox.match(/^\s*(-?[\d.]+)[ ,]+(-?[\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)\s*$/) ?? []
    assert.ok(minX !== undefined && minY !== undefined && Number(width) > 0 && Number(height) > 0, `${country.id} needs a valid intrinsic viewBox`)
    aspectRatios.add(Number(width) / Number(height))
    assert.match(source, /<\/svg>\s*$/i, `${country.id} SVG must close its root element`)
    assert.doesNotMatch(source, /<(?:image|script|foreignObject|feImage)\b/i, `${country.id} must not embed external content`)
    assert.doesNotMatch(source, /\b(?:xlink:)?href\s*=\s*["'](?!#)/i, `${country.id} href references must be local fragments`)
    assert.doesNotMatch(source, /url\(\s*["']?(?!#)/i, `${country.id} URL references must be local fragments`)
    const localIds = new Set([...source.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]))
    const localReferences = [...source.matchAll(/(?:xlink:)?href=["']#([^"']+)|url\(\s*["']?#([^\s)"']+)/g)]
      .map((match) => match[1] ?? match[2])
    for (const reference of localReferences) assert.ok(localIds.has(reference), `${country.id} local reference #${reference} must resolve`)

    const tags = [...source.matchAll(/<\/?([A-Za-z_][\w:.-]*)\b[^<>]*?>/g)]
    const stack: string[] = []
    for (const [tag] of tags) {
      const closing = /^<\//.test(tag)
      const name = tag.match(/^<\/?([A-Za-z_][\w:.-]*)/)?.[1]
      assert.ok(name, `${country.id} contains a malformed XML element`)
      if (closing) assert.equal(stack.pop(), name, `${country.id} XML element nesting must be valid`)
      else if (!/\/\s*>$/.test(tag)) stack.push(name!)
    }
    assert.deepEqual(stack, [], `${country.id} SVG elements must all be closed`)
  }
  assert.ok(aspectRatios.size > 20, 'national flag SVGs should retain their varied aspect ratios')
})

test('creates ten questions with unique correct countries and exactly one correct choice', () => {
  const round = createFlagRound(seeded(12))
  assert.equal(round.length, ROUND_LENGTH)
  assert.equal(new Set(round.map(({ country }) => country.id)).size, ROUND_LENGTH)
  for (const question of round) {
    assert.equal(question.choices.length, 4)
    assert.equal(new Set(question.choices.map(({ id }) => id)).size, 4)
    assert.equal(question.choices.filter(({ id }) => id === question.country.id).length, 1)
  }
})

test('generation is deterministic for a supplied random source and can vary answer order', () => {
  assert.deepEqual(createFlagRound(seeded(4)), createFlagRound(seeded(4)))
  assert.notDeepEqual(createFlagRound(seeded(4)).map((question) => question.choices.map(({ id }) => id)), createFlagRound(seeded(5)).map((question) => question.choices.map(({ id }) => id)))
})

test('reports correct and incorrect answers without changing the question', () => {
  const question = createFlagRound(seeded(2))[0]!
  const right = checkFlagAnswer(question, question.country.id)
  const wrongChoice = question.choices.find(({ id }) => id !== question.country.id)!
  const wrong = checkFlagAnswer(question, wrongChoice.id)
  assert.deepEqual(right, { correct: true, selected: question.country, answer: question.country })
  assert.deepEqual(wrong, { correct: false, selected: wrongChoice, answer: question.country })
  assert.throws(() => checkFlagAnswer(question, 'unknown'))
})

test('the displayed flag reference stays neutral and cannot announce the country before an answer', () => {
  const question = createFlagRound(seeded(22))[0]!
  const flagCardSource = readFileSync(new URL('../ui/FlagCard.tsx', import.meta.url), 'utf8')
  const styles = readFileSync(new URL('../../../styles/tailwind.css', import.meta.url), 'utf8')
  assert.equal(question.country.flag, `/flags/${question.country.id}.svg`)
  assert.match(flagCardSource, /aria-label="An unlabeled national flag\. Identify the country shown\."/)
  assert.match(flagCardSource, /alt=""/)
  assert.doesNotMatch(flagCardSource, /aria-label=\{.*country\.name|alt=\{.*country\.name/)
  assert.match(styles, /\.flags-flag-card__image\s*\{[^}]*object-fit:\s*contain/s)
})

test('answer feedback pauses progress, the tenth answer completes, and replay resets state', () => {
  let state = createFlagsGameState(seeded(44))
  assert.equal(state.index, 0)
  for (let attempt = 0; attempt < ROUND_LENGTH; attempt += 1) {
    const question = state.round[state.index]!
    const before = state
    state = submitFlagsAnswer(state, question.country.id)
    assert.equal(state.correctCount, attempt + 1)
    assert.equal(state.index, before.index)
    assert.equal(continueFlagsRound(state).index, attempt + 1)
    if (attempt < ROUND_LENGTH - 1) state = continueFlagsRound(state)
  }
  assert.equal(state.index, ROUND_LENGTH - 1)
  state = continueFlagsRound(state)
  assert.equal(state.index, ROUND_LENGTH)
  assert.equal(state.feedback, null)
  assert.equal(submitFlagsAnswer(state, 'us'), state)

  const replay = createFlagsGameState(seeded(45))
  assert.equal(replay.index, 0)
  assert.equal(replay.correctCount, 0)
  assert.equal(replay.feedback, null)
  assert.equal(replay.round.length, ROUND_LENGTH)
  assert.notDeepEqual(replay.round, state.round)
})

test('incorrect answer feedback includes the chosen country and correct country, and locks repeats', () => {
  const state = createFlagsGameState(seeded(9))
  const question = state.round[0]!
  const wrong = question.choices.find(({ id }) => id !== question.country.id)!
  const answered = submitFlagsAnswer(state, wrong.id)
  assert.equal(answered.feedback?.correct, false)
  assert.equal(answered.feedback?.selected.id, wrong.id)
  assert.equal(answered.feedback?.answer.id, question.country.id)
  assert.equal(answered.correctCount, 0)
  assert.equal(submitFlagsAnswer(answered, question.country.id), answered)
  assert.equal(continueFlagsRound(answered).index, 1)
})

test('country regions follow the fixed UN M49 grouping for the existing 195-country set', () => {
  assert.deepEqual(FLAG_REGIONS.map((region) => [region, getCountriesForRegion(region).length]), [
    ['Europe', 44], ['Asia', 48], ['Africa', 54], ['Americas', 35], ['Oceania', 14],
  ])
  assert.equal(getCountriesForRegion('all'), COUNTRIES)
  assert.equal(new Set(COUNTRIES.map(({ id }) => id)).size, 195)
  assert.ok(COUNTRIES.every(({ region }) => FLAG_REGIONS.includes(region as (typeof FLAG_REGIONS)[number])))
  assert.equal(COUNTRIES.find(({ id }) => id === 'tr')?.region, 'Asia')
  assert.equal(COUNTRIES.find(({ id }) => id === 'cy')?.region, 'Asia')
  assert.equal(COUNTRIES.find(({ id }) => id === 'ru')?.region, 'Europe')
  assert.equal(COUNTRIES.find(({ id }) => id === 'ps')?.region, 'Asia')
})

test('each region supports ten unique correct countries and four unique in-region choices', () => {
  for (const [index, region] of FLAG_REGIONS.entries()) {
    const eligible = getCountriesForRegion(region)
    assert.ok(eligible.length >= ROUND_LENGTH + 3)
    const round = createFlagRound(seeded(index + 100), eligible)
    assert.equal(round.length, ROUND_LENGTH)
    assert.equal(new Set(round.map(({ country }) => country.id)).size, ROUND_LENGTH)
    for (const question of round) {
      assert.equal(question.choices.length, 4)
      assert.equal(new Set(question.choices.map(({ id }) => id)).size, 4)
      assert.ok(question.choices.every((choice) => choice.region === region))
    }
    const practice = createFlagsPracticeState(seeded(index + 300), eligible)
    assert.ok([practice.question, ...practice.pending.map(({ question }) => question)].every((question) =>
      question.country.region === region && question.choices.every((choice) => choice.region === region)))
  }
})

test('Classic defaults to the unchanged all-country round', () => {
  assert.deepEqual(createFlagsGameState(seeded(711)), createFlagsGameState(seeded(711), getCountriesForRegion('all')))
})

test('Practice starts with ten unique countries and tracks unique learned progress', () => {
  let state = createFlagsPracticeState(seeded(21))
  const initial = [state.question, ...state.pending.map(({ question }) => question)]
  assert.equal(initial.length, ROUND_LENGTH)
  assert.equal(new Set(initial.map(({ country }) => country.id)).size, ROUND_LENGTH)
  assert.ok(initial.every(({ choices }) => choices.length === 4 && new Set(choices.map(({ id }) => id)).size === 4))

  state = submitFlagsPracticeAnswer(state, state.question.country.id)
  assert.equal(state.learnedIds.length, 1)
  assert.ok(state.learnedIds.includes(initial[0]!.country.id))
  const duplicateSubmission = submitFlagsPracticeAnswer(state, state.question.country.id)
  assert.equal(duplicateSubmission, state)
  assert.ok(!state.pending.some(({ question }) => question.country.id === initial[0]!.country.id))
  assert.equal(continueFlagsPractice(state).learnedIds.length, 1)
  assert.deepEqual(createFlagsPracticeState(seeded(21)), createFlagsPracticeState(seeded(21)))
})

test('Practice does not enqueue duplicate pending retries', () => {
  const initial = createFlagsPracticeState(seeded(29))
  const stateWithPendingCopy = {
    ...initial,
    pending: [...initial.pending, { question: initial.question, retry: true }],
  }
  const wrong = initial.question.choices.find(({ id }) => id !== initial.question.country.id)!
  const answered = submitFlagsPracticeAnswer(stateWithPendingCopy, wrong.id)
  assert.equal(answered.pending.filter(({ question }) => question.country.id === initial.question.country.id).length, 1)
})

test('missed flags wait behind other questions, retry once at a time, and eventually complete', () => {
  let state = createFlagsPracticeState(seeded(32))
  const initialIds = new Set([state.question.country.id, ...state.pending.map(({ question }) => question.country.id)])
  const firstMiss = state.question.country.id
  const wrongChoice = state.question.choices.find(({ id }) => id !== firstMiss)!
  state = submitFlagsPracticeAnswer(state, wrongChoice.id)
  assert.equal(state.learnedIds.length, 0)
  assert.equal(state.pending.filter(({ question }) => question.country.id === firstMiss).length, 1)
  state = continueFlagsPractice(state)
  assert.notEqual(state.question.country.id, firstMiss)

  let initialQuestionsAnswered = 1
  let guard = 0
  while (state.learnedIds.length < ROUND_LENGTH && guard++ < 200) {
    const id = state.question.country.id
    const isInitial = initialIds.has(id) && !state.currentIsRetry
    const selectedId = isInitial
      ? state.question.choices.find(({ id: choiceId }) => choiceId !== id)!.id
      : id
    state = submitFlagsPracticeAnswer(state, selectedId)
    if (isInitial) initialQuestionsAnswered += 1
    const shouldBeComplete = state.learnedIds.length === ROUND_LENGTH
    const nextState = continueFlagsPractice(state)
    if (!shouldBeComplete && id === firstMiss && state.currentIsRetry) {
      assert.ok(nextState.question.country.id !== firstMiss || nextState.pending.length === 0)
    }
    state = nextState
  }
  assert.ok(guard < 200, 'practice retries must stay finite when answered correctly on retry')
  assert.equal(initialQuestionsAnswered, ROUND_LENGTH)
  assert.equal(new Set(state.learnedIds).size, ROUND_LENGTH)
  assert.equal(state.complete, true)
  assert.equal(state.additionalAttempts, ROUND_LENGTH)
  assert.equal(submitFlagsPracticeAnswer(state, state.question.country.id), state)
})

test('Practice allows repeated misses, does not finish early, and resets for replay', () => {
  let state = createFlagsPracticeState(seeded(82))
  const first = state.question.country.id
  const wrongId = state.question.choices.find(({ id }) => id !== first)!.id
  state = submitFlagsPracticeAnswer(state, wrongId)
  state = continueFlagsPractice(state)

  let guard = 0
  while (state.question.country.id !== first && guard++ < ROUND_LENGTH) {
    state = submitFlagsPracticeAnswer(state, state.question.country.id)
    state = continueFlagsPractice(state)
  }
  assert.equal(state.question.country.id, first)
  assert.equal(state.currentIsRetry, true)
  state = submitFlagsPracticeAnswer(state, wrongId)
  assert.equal(state.complete, false)
  assert.equal(state.additionalAttempts, 1)
  assert.equal(state.pending.filter(({ question }) => question.country.id === first).length, 1)
  state = continueFlagsPractice(state)
  assert.equal(state.complete, false)

  const replay = createFlagsPracticeState(seeded(83))
  assert.equal(replay.learnedIds.length, 0)
  assert.equal(replay.additionalAttempts, 0)
  assert.equal(replay.turn, 1)
  assert.equal(replay.complete, false)
})

test('setup exposes accessible mode and region choices and keeps configuration outside active play', () => {
  const source = readFileSync(new URL('../ui/FlagsScreen.tsx', import.meta.url), 'utf8')
  assert.match(source, /useState<Mode>\('classic'\)/)
  assert.match(source, /useState<Region>\('all'\)/)
  assert.match(source, /aria-label="Mode"/)
  assert.match(source, /aria-label="Region"/)
  assert.match(source, /value: 'classic', label: 'Classic', description: 'See a flag, choose the country\.'/)
  assert.match(source, /value: 'practice', label: 'Practice', description: 'Learn flags and retry missed answers\.'/)
  assert.match(source, /value: 'reverse', label: 'Reverse', description: 'See a country, choose the flag\.'/)
  assert.match(source, /aria-pressed=\{mode === option\.value\}/)
  assert.match(source, /aria-pressed=\{region === option\.value\}/)
  assert.match(source, />Start game<\/button>/)
  assert.match(source, /End session and change setup/)
  assert.match(source, /Back to setup/)
  assert.match(source, /This flag will come back for another try/)
  assert.match(source, /of \$\{ROUND_LENGTH\} learned/)
  assert.match(source, /makeSession\(session\.mode, session\.region\)/)
})

test('Reverse option names stay neutral before an answer and identify feedback afterwards', () => {
  const question = createFlagRound(seeded(143))[0]!
  const selected = question.choices.find(({ id }) => id !== question.country.id)!
  const other = question.choices.find(({ id }) => id !== question.country.id && id !== selected.id)!
  const correct = question.country
  const neutral = getReverseFlagOptionStatus(0, selected.id, null)
  assert.equal(neutral.label, 'Flag option 1')
  assert.equal(neutral.visibleText, '')
  assert.ok(!neutral.label.includes(question.country.name))
  assert.deepEqual(question.choices.map((choice, index) => getReverseFlagOptionStatus(index, choice.id, null).label), [
    'Flag option 1', 'Flag option 2', 'Flag option 3', 'Flag option 4',
  ])

  const incorrectFeedback = checkFlagAnswer(question, selected.id)
  assert.equal(getReverseFlagOptionStatus(0, selected.id, incorrectFeedback).label, 'Flag option 1, your choice, incorrect')
  assert.equal(getReverseFlagOptionStatus(question.choices.indexOf(correct), correct.id, incorrectFeedback).visibleText, 'Correct answer')
  assert.equal(getReverseFlagOptionStatus(question.choices.indexOf(other), other.id, incorrectFeedback).visibleText, '')
  assert.equal(getReverseFlagOptionStatus(question.choices.indexOf(correct), correct.id, checkFlagAnswer(question, correct.id)).visibleText, 'Your choice · Correct answer')
})

test('Reverse uses the shared Classic round, scoring, answer lock, continuation, and completion rules', () => {
  let state = createFlagsGameState(seeded(152))
  const round = state.round
  for (let index = 0; index < ROUND_LENGTH; index += 1) {
    const question = state.round[state.index]!
    state = submitFlagsAnswer(state, question.country.id)
    assert.equal(state.correctCount, index + 1)
    assert.equal(submitFlagsAnswer(state, question.choices[0]!.id), state)
    state = continueFlagsRound(state)
  }
  assert.equal(state.index, ROUND_LENGTH)
  assert.equal(state.correctCount, ROUND_LENGTH)
  const replay = createFlagsGameState(seeded(153))
  assert.equal(replay.index, 0)
  assert.equal(replay.correctCount, 0)
  assert.notDeepEqual(replay.round, round)
})

test('Reverse UI shows a country prompt and four neutral, local SVG flag buttons', () => {
  const source = readFileSync(new URL('../ui/FlagsScreen.tsx', import.meta.url), 'utf8')
  assert.match(source, /Which is the flag of \$\{question\.country\.name\}\?/)
  assert.match(source, /role="group" aria-label="Flag choices"/)
  assert.match(source, /question\?\.choices\.map\(\(choice, index\)/)
  assert.match(source, /getReverseFlagOptionStatus\(index, choice\.id, feedback\)/)
  assert.match(source, /aria-label=\{optionStatus\.label\}/)
  assert.match(source, /<img src=\{choice\.flag\} alt="" aria-hidden="true" \/>/)
  assert.match(source, /question && session\.mode !== 'reverse' \? <FlagCard/)
  assert.doesNotMatch(source, /title=/)
  assert.match(source, /feedback\.answer\.name\}'s flag/)
  assert.doesNotMatch(source, /aria-label=\{choice\.name\}/)
})
