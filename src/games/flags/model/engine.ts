import { COUNTRIES, type Country } from './countries.ts'

export type FlagQuestion = {
  country: Country
  choices: readonly Country[]
}

export const ROUND_LENGTH = 10
export type RandomSource = () => number

const shuffled = <T,>(values: readonly T[], random: RandomSource): T[] => {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1))
    ;[result[index], result[other]] = [result[other]!, result[index]!]
  }
  return result
}

const createQuestion = (country: Country, countries: readonly Country[], random: RandomSource): FlagQuestion => {
  const distractors = shuffled(countries.filter((item) => item.id !== country.id), random).slice(0, 3)
  return { country, choices: shuffled([country, ...distractors], random) }
}

export const createFlagRound = (random: RandomSource = Math.random, countries: readonly Country[] = COUNTRIES): FlagQuestion[] => {
  if (countries.length < ROUND_LENGTH + 3) throw new Error('At least 13 countries are required to create a Flags round.')
  const correctCountries = shuffled(countries, random).slice(0, ROUND_LENGTH)
  return correctCountries.map((country) => createQuestion(country, countries, random))
}

export type AnswerFeedback = { correct: boolean; selected: Country; answer: Country }

export const getReverseFlagOptionStatus = (index: number, choiceId: string, feedback: AnswerFeedback | null): { label: string; visibleText: string } => {
  const label = `Flag option ${index + 1}`
  if (!feedback) return { label, visibleText: '' }
  const selected = feedback.selected.id === choiceId
  const correct = feedback.answer.id === choiceId
  if (selected && correct) return { label: `${label}, your choice and the correct answer`, visibleText: 'Your choice · Correct answer' }
  if (selected) return { label: `${label}, your choice, incorrect`, visibleText: 'Your choice · Incorrect' }
  if (correct) return { label: `${label}, correct answer`, visibleText: 'Correct answer' }
  return { label, visibleText: '' }
}

export const checkFlagAnswer = (question: FlagQuestion, selectedId: string): AnswerFeedback => {
  const selected = question.choices.find(({ id }) => id === selectedId)
  if (!selected) throw new Error('The selected answer is not one of the question choices.')
  return { correct: selected.id === question.country.id, selected, answer: question.country }
}

export type FlagsGameState = {
  round: FlagQuestion[]
  index: number
  correctCount: number
  feedback: AnswerFeedback | null
}

export const createFlagsGameState = (random: RandomSource = Math.random, countries: readonly Country[] = COUNTRIES): FlagsGameState => ({
  round: createFlagRound(random, countries),
  index: 0,
  correctCount: 0,
  feedback: null,
})

export const submitFlagsAnswer = (state: FlagsGameState, id: string): FlagsGameState => {
  const question = state.round[state.index]
  if (state.feedback || !question) return state
  const feedback = checkFlagAnswer(question, id)
  return { ...state, feedback, correctCount: state.correctCount + (feedback.correct ? 1 : 0) }
}

export const continueFlagsRound = (state: FlagsGameState): FlagsGameState =>
  state.feedback && state.index < ROUND_LENGTH
    ? { ...state, index: state.index + 1, feedback: null }
    : state

export type FlagsPracticeState = {
  question: FlagQuestion
  currentIsRetry: boolean
  pending: readonly { question: FlagQuestion; retry: boolean }[]
  learnedIds: readonly string[]
  additionalAttempts: number
  feedback: AnswerFeedback | null
  complete: boolean
  turn: number
}

export const createFlagsPracticeState = (random: RandomSource = Math.random, countries: readonly Country[] = COUNTRIES): FlagsPracticeState => {
  const initialQuestions = createFlagRound(random, countries)
  return {
    question: initialQuestions[0]!,
    currentIsRetry: false,
    pending: initialQuestions.slice(1).map((question) => ({ question, retry: false })),
    learnedIds: [],
    additionalAttempts: 0,
    feedback: null,
    complete: false,
    turn: 1,
  }
}

export const submitFlagsPracticeAnswer = (state: FlagsPracticeState, id: string): FlagsPracticeState => {
  if (state.feedback || state.complete) return state
  const feedback = checkFlagAnswer(state.question, id)
  const learnedIds = feedback.correct && !state.learnedIds.includes(feedback.answer.id)
    ? [...state.learnedIds, feedback.answer.id]
    : state.learnedIds
  const pending = !feedback.correct && !state.pending.some(({ question }) => question.country.id === state.question.country.id)
    ? [...state.pending, { question: state.question, retry: true }]
    : state.pending
  return {
    ...state,
    learnedIds,
    pending,
    additionalAttempts: state.additionalAttempts + (state.currentIsRetry ? 1 : 0),
    feedback,
  }
}

export const continueFlagsPractice = (state: FlagsPracticeState): FlagsPracticeState => {
  if (!state.feedback) return state
  if (state.learnedIds.length === ROUND_LENGTH) return { ...state, feedback: null, complete: true }
  const [next, ...pending] = state.pending
  if (!next) throw new Error('Practice has unlearned flags but no questions are pending.')
  return {
    ...state,
    question: next.question,
    currentIsRetry: next.retry,
    pending,
    feedback: null,
    turn: state.turn + 1,
  }
}
