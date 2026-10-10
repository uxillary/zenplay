import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const screen = readFileSync(new URL('./FlagsScreen.tsx', import.meta.url), 'utf8')
const learningCard = readFileSync(new URL('./FlagLearningFeedback.tsx', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../../../styles/tailwind.css', import.meta.url), 'utf8')

test('learning hooks are looked up only for submitted feedback about the correct country', () => {
  assert.match(screen, /const learningHook = feedback \? getFlagMemoryHook\(feedback\.answer\.id\) : undefined/)
  assert.match(screen, /learningHook && feedback[\s\S]*?FlagLearningFeedback/)
  assert.doesNotMatch(screen, /getFlagMemoryHook\(question\.country\.id\)/)
})

test('Classic and Reverse use a collapsed native disclosure with a labelled hook card', () => {
  assert.match(screen, /<FlagLearningFeedback hook=\{learningHook\} questionKey=\{questionToken\} \/>/)
  assert.match(learningCard, /<details className="flags-learning" key=\{questionKey\}>/)
  assert.match(learningCard, /<summary>[\s\S]*?Did you know\?[\s\S]*?<\/summary>/)
  assert.match(learningCard, /<h3 id="flags-learning-heading" className="flags-learning__heading">Remember this flag<\/h3>/)
  assert.doesNotMatch(learningCard, /<details[^>]*\bopen(?:=|\s|>)/)
  assert.match(learningCard, /\{hook\.explanation \? <p className="flags-learning__explanation">\{hook\.explanation\}<\/p> : null\}/)
})

test('Practice highlights hooks on mistakes and keeps correct-answer hooks optional', () => {
  assert.match(screen, /session\.mode === 'practice' && !feedback\.correct[\s\S]*?<FlagLearningFeedback hook=\{learningHook\} prominent questionKey=\{questionToken\}/)
  assert.match(screen, /<FlagLearningFeedback hook=\{learningHook\} questionKey=\{questionToken\} \/>/)
  assert.match(screen, /You’ll see this flag again later\./)
})

test('missing hooks render no learning card, and the continue action remains outside the disclosure', () => {
  assert.match(screen, /\{learningHook && feedback[\s\S]*?: null\}/)
  const learningIndex = screen.indexOf('<FlagLearningFeedback')
  const continueIndex = screen.indexOf('{feedback ? <button ref={continueButton}')
  assert.ok(learningIndex >= 0 && continueIndex > learningIndex)
  assert.match(screen.slice(continueIndex), /Next flag/)
})

test('feedback has text and an icon; disclosure styling preserves focus and uses no motion', () => {
  assert.match(screen, /flags-screen__feedback-icon/)
  assert.match(screen, /aria-hidden="true">\{feedback\.correct \? '✓' : '↺'\}/)
  assert.match(learningCard, /<summary>/)
  assert.match(styles, /\.flags-learning summary \{[^}]*min-height:\s*2\.75rem/)
  assert.match(styles, /\.high-contrast \.flags-learning \{ border: 2px solid currentColor; \}/)
  assert.doesNotMatch(styles.match(/\.flags-learning[\s\S]*?(?=\.dark \.flags-learning)/)?.[0] ?? '', /animation|transition/)
})
