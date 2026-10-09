import { useEffect, useRef, useState } from 'react'
import { continueFlagsPractice, continueFlagsRound, createFlagsGameState, createFlagsPracticeState, getReverseFlagOptionStatus, ROUND_LENGTH, submitFlagsAnswer, submitFlagsPracticeAnswer, type FlagsGameState, type FlagsPracticeState } from '../model/engine'
import { FLAG_REGIONS, getCountriesForRegion, type FlagRegion } from '../model/countries'
import { FlagCard } from './FlagCard'

type Props = { onBack: () => void }
type Mode = 'classic' | 'practice' | 'reverse'
type Region = FlagRegion | 'all'
type Session =
  | { mode: 'classic' | 'reverse'; region: Region; game: FlagsGameState }
  | { mode: 'practice'; region: Region; game: FlagsPracticeState }

const modeOptions: readonly { value: Mode; label: string; description: string }[] = [
  { value: 'classic', label: 'Classic', description: 'See a flag, choose the country.' },
  { value: 'practice', label: 'Practice', description: 'Learn flags and retry missed answers.' },
  { value: 'reverse', label: 'Reverse', description: 'See a country, choose the flag.' },
]
const regionOptions: readonly { value: Region; label: string }[] = [
  { value: 'all', label: 'All countries' },
  ...FLAG_REGIONS.map((region) => ({ value: region, label: region })),
]

export const FlagsScreen = ({ onBack }: Props) => {
  const [mode, setMode] = useState<Mode>('classic')
  const [region, setRegion] = useState<Region>('all')
  const [session, setSession] = useState<Session | null>(null)
  const setupHeading = useRef<HTMLHeadingElement>(null)
  const resultHeading = useRef<HTMLHeadingElement>(null)
  const questionPrompt = useRef<HTMLHeadingElement>(null)
  const continueButton = useRef<HTMLButtonElement>(null)
  const previousView = useRef({ hasSession: false, token: '', complete: false })

  const game = session?.game
  const complete = session?.mode === 'practice'
    ? session.game.complete
    : session ? session.game.index >= ROUND_LENGTH : false
  const feedback = game?.feedback ?? null
  const question = session?.mode === 'practice'
    ? session.game.question
    : session ? session.game.round[session.game.index] : undefined
  const questionToken = session?.mode === 'practice'
    ? `practice-${session.game.turn}`
    : session ? `${session.mode}-${session.game.index}` : ''

  useEffect(() => {
    const previous = previousView.current
    if (!session) {
      if (previous.hasSession) setupHeading.current?.focus()
    } else if (feedback) continueButton.current?.focus()
    else if (complete) resultHeading.current?.focus()
    else if (!previous.hasSession || previous.token !== questionToken || previous.complete) questionPrompt.current?.focus()
    previousView.current = { hasSession: Boolean(session), token: questionToken, complete }
  }, [complete, feedback, questionToken, session])

  const makeSession = (selectedMode: Mode, selectedRegion: Region): Session => {
    const countries = getCountriesForRegion(selectedRegion)
    if (selectedMode === 'practice') return { mode: 'practice', region: selectedRegion, game: createFlagsPracticeState(Math.random, countries) }
    return { mode: selectedMode, region: selectedRegion, game: createFlagsGameState(Math.random, countries) }
  }

  const startSession = () => setSession(makeSession(mode, region))
  const replay = () => {
    if (session) setSession(makeSession(session.mode, session.region))
  }
  const endSession = () => setSession(null)

  const answer = (id: string) => {
    setSession((current) => {
      if (!current || current.game.feedback) return current
      return current.mode === 'practice'
        ? { ...current, game: submitFlagsPracticeAnswer(current.game, id) }
        : { ...current, game: submitFlagsAnswer(current.game, id) }
    })
  }
  const next = () => {
    setSession((current) => {
      if (!current) return current
      return current.mode === 'practice'
        ? { ...current, game: continueFlagsPractice(current.game) }
        : { ...current, game: continueFlagsRound(current.game) }
    })
  }

  if (!session) return (
    <section className="flags-screen flags-setup mx-auto w-full max-w-xl space-y-5" aria-labelledby="flags-setup-title">
      <h2 ref={setupHeading} id="flags-setup-title" tabIndex={-1} data-screen-heading className="text-2xl font-semibold">Choose how to play</h2>
      <fieldset className="space-y-2">
        <legend className="font-semibold">Mode</legend>
        <div className="flags-setup__options flags-setup__options--mode" role="group" aria-label="Mode">
          {modeOptions.map((option) => (
            <button key={option.value} type="button" className={`zen-choice-button flags-setup__mode-option${mode === option.value ? ' is-selected' : ''}`} aria-pressed={mode === option.value} onClick={() => setMode(option.value)}>
              <span className="font-semibold">{option.label}</span><span className="flags-setup__mode-description">{option.description}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="font-semibold">Region</legend>
        <div className="flags-setup__options flags-setup__options--region" role="group" aria-label="Region">
          {regionOptions.map((option) => (
            <button key={option.value} type="button" className={`zen-choice-button${region === option.value ? ' is-selected' : ''}`} aria-pressed={region === option.value} onClick={() => setRegion(option.value)}>{option.label}</button>
          ))}
        </div>
      </fieldset>
      <button type="button" className="zen-game-button zen-game-button--primary" onClick={startSession}>Start game</button>
    </section>
  )

  if (complete) return (
    <section className="flags-screen mx-auto w-full max-w-xl space-y-5" aria-labelledby="flags-results-title">
      <h2 ref={resultHeading} id="flags-results-title" data-screen-heading tabIndex={-1} className="text-2xl font-semibold">{session.mode === 'practice' ? 'Practice complete' : 'Round complete'}</h2>
      {session.mode !== 'practice' ? <>
        <p className="text-2xl font-semibold" role="status">{session.game.correctCount} of {ROUND_LENGTH} correct</p>
        <p className="text-lg">Thanks for playing. You can start another round whenever you like.</p>
      </> : <>
        <p className="text-2xl font-semibold" role="status">{session.game.learnedIds.length} flags learned</p>
        {session.game.additionalAttempts > 0 ? <p className="text-lg">You took {session.game.additionalAttempts} extra {session.game.additionalAttempts === 1 ? 'attempt' : 'attempts'} along the way.</p> : null}
        <p className="text-lg">Nice work. Every flag found its way into memory.</p>
      </>}
      <div className="flex flex-wrap gap-3">
        <button type="button" className="zen-game-button zen-game-button--primary" onClick={replay}>{session.mode === 'practice' ? 'Practice again' : 'Play again'}</button>
        <button type="button" className="zen-game-button" onClick={endSession}>Back to setup</button>
        <button type="button" className="zen-game-button" onClick={onBack}>Back to Games</button>
      </div>
    </section>
  )

  const progressLabel = session.mode === 'practice'
    ? `${session.game.learnedIds.length} of ${ROUND_LENGTH} learned`
    : `Question ${session.game.index + 1} of ${ROUND_LENGTH}`
  const feedbackText = feedback
    ? feedback.correct
      ? `Correct! ${feedback.answer.name}.`
      : session.mode === 'reverse'
        ? `Not quite — that's ${feedback.answer.name}'s flag. You chose the flag of ${feedback.selected.name}.`
        : `Not quite — that's the flag of ${feedback.answer.name}. You chose ${feedback.selected.name}.${session.mode === 'practice' ? ' This flag will come back for another try.' : ''}`
    : session.mode === 'practice'
      ? 'Choose the country that matches the flag. Missed flags will return for another try.'
      : 'Choose the country that matches the flag.'

  return (
    <section className="flags-screen mx-auto w-full max-w-xl space-y-4" aria-labelledby="flags-question-title">
      <div className="flags-screen__progress" role="group" aria-label={session.mode === 'practice' ? 'Practice progress' : progressLabel}>
        {session.mode === 'practice' ? <span aria-live="polite">{progressLabel}</span> : <span aria-hidden="true">{session.game.index + 1} of {ROUND_LENGTH}</span>}
      </div>
      {question && session.mode !== 'reverse' ? <FlagCard src={question.country.flag} /> : null}
      <h2 ref={questionPrompt} id="flags-question-title" tabIndex={-1} className="text-xl font-semibold">
        {session.mode === 'reverse' && question ? `Which is the flag of ${question.country.name}?` : 'Which country is this?'}
      </h2>
      {session.mode === 'reverse' ? <div className="flags-reverse-choices" role="group" aria-label="Flag choices">
        {question?.choices.map((choice, index) => {
          const optionStatus = getReverseFlagOptionStatus(index, choice.id, feedback)
          const chosen = feedback?.selected.id === choice.id
          const isAnswer = feedback?.answer.id === choice.id
          return (
            <button
              type="button"
              key={choice.id}
              className={`flags-reverse-choice${chosen ? ' is-selected' : ''}${isAnswer && feedback ? ' is-correct' : ''}`}
              onClick={() => answer(choice.id)}
              disabled={Boolean(feedback)}
              aria-pressed={chosen}
              aria-label={optionStatus.label}
            >
              <span className="flags-reverse-choice__card">
                <img src={choice.flag} alt="" aria-hidden="true" />
                <span className="flags-reverse-choice__status" aria-hidden="true">{optionStatus.visibleText}</span>
              </span>
            </button>
          )
        })}
      </div> : <div className="space-y-3" role="group" aria-label="Country choices">
        {question?.choices.map((choice) => {
          const chosen = feedback?.selected.id === choice.id
          const isAnswer = feedback?.answer.id === choice.id
          let stateText = ''
          if (feedback && chosen) stateText = feedback.correct ? ' — Correct answer' : ' — Your choice (incorrect)'
          else if (feedback && isAnswer) stateText = ' — Correct answer'
          return (
            <button
              type="button"
              key={choice.id}
              className={`zen-choice-button flags-screen__choice${chosen ? ' is-selected' : ''}${isAnswer && feedback ? ' is-correct' : ''}`}
              onClick={() => answer(choice.id)}
              disabled={Boolean(feedback)}
              aria-pressed={chosen}
            >
              <span className="flags-screen__choice-label">{choice.name}<span className="flags-screen__choice-state">{stateText}</span></span>
            </button>
          )
        })}
      </div>}
      <p className="flags-screen__feedback" role="status" aria-live="polite" aria-atomic="true">{feedbackText}</p>
      {feedback ? <button ref={continueButton} type="button" className="zen-game-button zen-game-button--primary" onClick={next}>
        {session.mode !== 'practice'
          ? session.game.index === ROUND_LENGTH - 1 ? 'See results' : 'Next flag'
          : session.game.learnedIds.length === ROUND_LENGTH ? 'Finish practice' : 'Next flag'}
      </button> : null}
      <button type="button" className="zen-game-button zen-game-button--small" onClick={endSession}>End session and change setup</button>
    </section>
  )
}
