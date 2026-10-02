import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  codeDeliveryGuidance,
  codeExpiryGuidance,
  codeRequestFailure,
  codeRequestStatus,
  codeVerificationFailure,
  isEmailCodeResendBlocked,
  resendGuidance,
} from './emailCodeCopy.ts'

test('accepted requests get accurate waiting, address, and Spam/Junk guidance', () => {
  assert.equal(codeRequestStatus('ada@example.test'), "We've requested a sign-in email for ada@example.test.")
  const guidance = codeDeliveryGuidance('ada@example.test')
  assert.match(guidance, /ada@example\.test/)
  assert.match(guidance, /minute or two/)
  assert.match(guidance, /Spam or Junk/)
  assert.match(guidance, /new account.*confirms your email and signs you in/)
  assert.match(codeExpiryGuidance, /10 minutes/)
  assert.match(codeExpiryGuidance, /newest code/)
})

test('request and verification errors give recoverable plain-language guidance', () => {
  assert.match(codeRequestFailure, /wait about a minute/)
  assert.match(codeVerificationFailure, /Check the digits/)
  assert.match(codeVerificationFailure, /may have expired/)
})

test('resend cooldown blocks only the same address and announces only stable states', () => {
  assert.equal(isEmailCodeResendBlocked('ADA@example.test', 'ada@example.test', 60), true)
  assert.equal(isEmailCodeResendBlocked('new@example.test', 'ada@example.test', 60), false)
  assert.equal(isEmailCodeResendBlocked('', 'ada@example.test', 60), false)
  assert.equal(isEmailCodeResendBlocked('ada@example.test', 'ada@example.test', 0), false)
  assert.match(resendGuidance(true), /about one minute/)
  assert.match(resendGuidance(false), /request another email now/)
})

test('both local new-account and existing-account templates use codes, not confirmation links', () => {
  const confirmation = readFileSync('supabase/templates/confirmation.html', 'utf8')
  const magicLink = readFileSync('supabase/templates/magic_link.html', 'utf8')
  const config = readFileSync('supabase/config.toml', 'utf8')

  assert.match(confirmation, /\{\{\s*\.Token\s*\}\}/)
  assert.match(magicLink, /\{\{\s*\.Token\s*\}\}/)
  assert.doesNotMatch(confirmation, /ConfirmationURL/)
  assert.doesNotMatch(magicLink, /ConfirmationURL/)
  assert.match(config, /\[auth\.email\.template\.confirmation\]/)
  assert.match(config, /otp_expiry = 600/)
})
