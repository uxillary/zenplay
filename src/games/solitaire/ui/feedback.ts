export const ACTION_FEEDBACK_MS = 3200
export const INVALID_FEEDBACK_MS = 2800

type FeedbackInput = {
  verbose: boolean
  invalid: boolean
  hasHint: boolean
  selectedDescription: string | null
  actionMessage: string
  dragging: boolean
}

export const resolveFeedback = ({ verbose, invalid, hasHint, selectedDescription, actionMessage, dragging }: FeedbackInput) => {
  const selection = dragging ? '' : selectedDescription ?? ''
  const mode = invalid ? 'invalid'
    : hasHint ? 'hint'
      : verbose && selection ? 'selection'
        : verbose && actionMessage ? 'action' : 'stats'
  return {
    mode,
    screenReaderOnly: !verbose && !invalid && !hasHint ? selection || actionMessage : '',
  }
}
