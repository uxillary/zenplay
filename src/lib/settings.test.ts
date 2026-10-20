import assert from 'node:assert/strict'
import test from 'node:test'
import {
  defaultSettings,
  getEffectiveSettings,
  loadSettings,
  parseSettings,
  resolveTheme,
  resetStoredSettings,
  saveSettings,
  serializeSettings,
} from './settings.ts'

test('settings have readable, safe defaults', () => {
  assert.equal(defaultSettings.theme, 'dark')
  assert.equal(defaultSettings.uiScale, 'normal')
  assert.equal(defaultSettings.gamePieceScale, 'normal')
  assert.equal(defaultSettings.simpleMode, false)
  assert.equal(defaultSettings.solitaireTableTheme, 'classic-green')
  assert.equal(defaultSettings.solitaireCardStyle, 'classic')
  assert.equal(defaultSettings.solitaireCardBack, 'classic-blue')
  assert.equal(defaultSettings.solitaireVerboseFeedback, false)
  assert.equal(defaultSettings.solitaireShowPossibleMoves, false)
})

test('legacy saved settings retain existing preferences and migrate card size', () => {
  const migrated = parseSettings(JSON.stringify({
    theme: 'light', largeCards: true, highContrast: true, reducedMotion: true, handedness: 'left', timer: false,
  }))
  assert.equal(migrated.theme, 'light')
  assert.equal(migrated.gamePieceScale, 'large')
  assert.equal(migrated.highContrast, true)
  assert.equal(migrated.reducedMotion, true)
  assert.equal(migrated.handedness, 'left')
  assert.equal(migrated.timer, false)
  assert.equal(migrated.solitaireTableTheme, 'classic-green')
  assert.equal(migrated.solitaireCardStyle, 'classic')
  assert.equal(migrated.solitaireCardBack, 'classic-blue')
  const versionTwo = parseSettings(JSON.stringify({ version: 2, settings: { theme: 'light', drawMode: 'three' } }))
  assert.equal(versionTwo.theme, 'light')
  assert.equal(versionTwo.drawMode, 'three')
  assert.equal(versionTwo.solitaireTableTheme, 'classic-green')
  const versionThree = parseSettings(JSON.stringify({ version: 3, settings: {
    solitaireTableTheme: 'burgundy', solitaireCardStyle: 'large-print', solitaireCardBack: 'traditional-red',
    drawMode: 'three', timer: false,
  } }))
  assert.equal(versionThree.solitaireTableTheme, 'burgundy')
  assert.equal(versionThree.solitaireCardStyle, 'large-print')
  assert.equal(versionThree.solitaireCardBack, 'traditional-red')
  assert.equal(versionThree.drawMode, 'three')
  assert.equal(versionThree.timer, false)
  assert.equal(versionThree.solitaireVerboseFeedback, false)
  assert.equal(versionThree.solitaireShowPossibleMoves, false)
})

test('malformed and unsupported settings values fall back safely', () => {
  assert.deepEqual(parseSettings('{'), defaultSettings)
  assert.equal(parseSettings(JSON.stringify({ theme: 'sepia', uiScale: 'tiny' })).theme, defaultSettings.theme)
  const invalidAppearance = parseSettings(JSON.stringify({
    solitaireTableTheme: 'neon', solitaireCardStyle: 'tiny', solitaireCardBack: 'unknown',
  }))
  assert.equal(invalidAppearance.solitaireTableTheme, 'classic-green')
  assert.equal(invalidAppearance.solitaireCardStyle, 'classic')
  assert.equal(invalidAppearance.solitaireCardBack, 'classic-blue')
  const invalidAssistance = parseSettings(JSON.stringify({
    solitaireVerboseFeedback: 'true', solitaireShowPossibleMoves: 1,
  }))
  assert.equal(invalidAssistance.solitaireVerboseFeedback, false)
  assert.equal(invalidAssistance.solitaireShowPossibleMoves, false)
})

test('Solitaire assistance preferences persist independently', () => {
  const verbose = parseSettings(serializeSettings({ ...defaultSettings, solitaireVerboseFeedback: true }))
  assert.equal(verbose.solitaireVerboseFeedback, true)
  assert.equal(verbose.solitaireShowPossibleMoves, false)
  const highlighting = parseSettings(serializeSettings({ ...defaultSettings, solitaireShowPossibleMoves: true }))
  assert.equal(highlighting.solitaireVerboseFeedback, false)
  assert.equal(highlighting.solitaireShowPossibleMoves, true)
})

test('Solitaire appearance selections persist locally and leave the app theme alone', () => {
  let stored: string | null = null
  const storage = {
    getItem: (key: string) => key === 'zenplay-settings' ? stored : null,
    setItem: (_key: string, value: string) => { stored = value },
  }
  const selected = {
    ...defaultSettings,
    solitaireTableTheme: 'burgundy' as const,
    solitaireCardStyle: 'large-print' as const,
    solitaireCardBack: 'traditional-red' as const,
  }
  assert.equal(saveSettings(selected, storage), true)
  assert.deepEqual(loadSettings(storage), selected)
  assert.equal(loadSettings(storage).theme, defaultSettings.theme)
  const alternate = parseSettings(JSON.stringify({ ...selected, solitaireTableTheme: 'midnight-blue', solitaireCardBack: 'high-contrast' }))
  assert.equal(alternate.solitaireTableTheme, 'midnight-blue')
  assert.equal(alternate.solitaireCardBack, 'high-contrast')
})

test('versioned settings can be serialized and restored', () => {
  assert.deepEqual(parseSettings(serializeSettings({ ...defaultSettings, uiScale: 'large' })), {
    ...defaultSettings,
    uiScale: 'large',
  })
})

test('resetting preferences stores all defined defaults and reports storage failure', () => {
  let stored = ''
  const storage = { setItem: (_key: string, value: string) => { stored = value } }
  assert.equal(resetStoredSettings(storage), true)
  assert.deepEqual(parseSettings(stored), defaultSettings)
  assert.equal(resetStoredSettings({ setItem: () => { throw new Error('blocked') } }), false)
})

test('Simple Mode derives larger, higher contrast, reduced motion preferences', () => {
  const effective = getEffectiveSettings({ ...defaultSettings, simpleMode: true })
  assert.equal(effective.uiScale, 'extra-large')
  assert.equal(effective.gamePieceScale, 'large')
  assert.equal(effective.highContrast, true)
  assert.equal(effective.reducedMotion, true)
  assert.equal(effective.calmStats, true)
  assert.equal(getEffectiveSettings(defaultSettings).calmStats, false)
  assert.equal(getEffectiveSettings(defaultSettings, true).reducedMotion, true)
})

test('system theme resolution follows the supplied device preference', () => {
  assert.equal(resolveTheme('system', true), 'dark')
  assert.equal(resolveTheme('system', false), 'light')
  assert.equal(resolveTheme('light', true), 'light')
})
