export const codeRequestStatus = (email: string) =>
  `We've requested a sign-in email for ${email}.`

export const codeDeliveryGuidance = (email: string) =>
  `We've requested a sign-in email for ${email}. It may take a minute or two to arrive. Check your Spam or Junk folder if you don't see it. Enter the six-digit code below to finish signing in. For a new account, entering the code also confirms your email and signs you in.`

export const codeRequestFailure =
  'We could not request a sign-in email right now. Check the address and wait about a minute before trying again.'

export const codeExpiryGuidance = 'The code expires after 10 minutes. If you request another email, use the newest code.'

export const codeVerificationFailure =
  "We couldn't verify that code. Check the digits, or request a new email if the code may have expired."

export const resendGuidance = (waiting: boolean) => waiting
  ? 'You can request another email about one minute after your last request.'
  : 'You can request another email now.'

export const isEmailCodeResendBlocked = (
  email: string,
  cooldownEmail: string,
  secondsRemaining: number,
) => secondsRemaining > 0
  && email.trim().toLowerCase() === cooldownEmail.trim().toLowerCase()
  && email.trim().length > 0
