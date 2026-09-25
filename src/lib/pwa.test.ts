import assert from 'node:assert/strict'
import test from 'node:test'
import { getInstallExperience, isStandaloneMode } from './pwa.ts'

test('detects installed display modes from the browser or iOS standalone flag', () => {
  assert.equal(isStandaloneMode(true, false), true)
  assert.equal(isStandaloneMode(false, true), true)
  assert.equal(isStandaloneMode(false, false), false)
})

test('chooses install guidance for installed, prompt, iOS, and other browsers', () => {
  assert.equal(getInstallExperience(true, true, true), 'installed')
  assert.equal(getInstallExperience(false, true, false), 'prompt')
  assert.equal(getInstallExperience(false, false, true), 'ios-manual')
  assert.equal(getInstallExperience(false, false, false), 'browser-manual')
})
