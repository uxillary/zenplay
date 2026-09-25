import assert from 'node:assert/strict'
import test from 'node:test'
import {
  defaultSettings,
  getEffectiveSettings,
  parseSettings,
  resolveTheme,
  serializeSettings,
} from './settings.ts'

test('settings have readable, safe defaults', () => {
  assert.equal(defaultSettings.theme, 'dark')
  assert.equal(defaultSettings.uiScale, 'normal')
  assert.equal(defaultSettings.gamePieceScale, 'normal')
  assert.equal(defaultSettings.simpleMode, false)
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
})

test('malformed and unsupported settings values fall back safely', () => {
  assert.deepEqual(parseSettings('{'), defaultSettings)
  assert.equal(parseSettings(JSON.stringify({ theme: 'sepia', uiScale: 'tiny' })).theme, defaultSettings.theme)
})

test('versioned settings can be serialized and restored', () => {
  assert.deepEqual(parseSettings(serializeSettings({ ...defaultSettings, uiScale: 'large' })), {
    ...defaultSettings,
    uiScale: 'large',
  })
})

test('Simple Mode derives larger, higher contrast, reduced motion preferences', () => {
  const effective = getEffectiveSettings({ ...defaultSettings, simpleMode: true })
  assert.equal(effective.uiScale, 'extra-large')
  assert.equal(effective.gamePieceScale, 'large')
  assert.equal(effective.highContrast, true)
  assert.equal(effective.reducedMotion, true)
  assert.equal(getEffectiveSettings(defaultSettings, true).reducedMotion, true)
})

test('system theme resolution follows the supplied device preference', () => {
  assert.equal(resolveTheme('system', true), 'dark')
  assert.equal(resolveTheme('system', false), 'light')
  assert.equal(resolveTheme('light', true), 'light')
})
