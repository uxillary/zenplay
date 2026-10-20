import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'

type Props = {
  title: string
  description?: string
  alert?: boolean
  onDismiss?: () => void
  focusHeading?: boolean
  children: ReactNode
}

export const GameDialog = ({ title, description, alert = false, onDismiss, focusHeading = false, children }: Props) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialogRef.current?.querySelector<HTMLElement>(focusHeading ? '[data-game-dialog-heading]' : 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')?.focus()
    return () => {
      const fallback = document.querySelector<HTMLElement>('.zen-game-button')
      if (previousFocus.current?.isConnected) previousFocus.current.focus()
      else fallback?.focus()
    }
  }, [focusHeading])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && onDismiss) {
      event.preventDefault()
      onDismiss()
      return
    }
    if (event.key !== 'Tab') return
    const controls = [...(dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? [])]
    if (controls.length === 0) return
    const first = controls[0]
    const last = controls[controls.length - 1]
    if (focusHeading && event.shiftKey && document.activeElement === dialogRef.current?.querySelector('[data-game-dialog-heading]')) {
      event.preventDefault()
      last.focus()
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="zen-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
      <section
        ref={dialogRef}
        role={alert ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby="game-dialog-title"
        aria-describedby={description ? 'game-dialog-description' : undefined}
        className="zen-dialog max-h-[calc(100dvh-2rem)] w-full max-w-lg space-y-4 overflow-y-auto p-6"
      >
        <h2 id="game-dialog-title" data-game-dialog-heading tabIndex={-1} className="text-2xl font-semibold">{title}</h2>
        {description ? <p id="game-dialog-description" className="text-lg">{description}</p> : null}
        {children}
      </section>
    </div>
  )
}
