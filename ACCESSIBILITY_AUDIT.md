# ZenPlay accessibility audit

**Reviewed:** 25 September 2026  
**Scope:** Home, Settings, install/update feedback, shared dialogs and all six launch games.  
**Guidance:** Relevant WCAG 2.2 AA criteria and ZenPlay's accessibility and cognitive-accessibility guidance in `context/ZENPLAY_PROJECT_CONTEXT.md`.

This is a product review, not a conformance evaluation or certification.

## Findings and changes

- **Solitaire information exposure:** the card-name formatter did not check whether a supplied card was face up. Names now say “face-down card” until visible, including in column, pile and hint descriptions. Regression tests cover face-down, face-up and empty descriptions.
- **Pairs information exposure:** hidden cards are named only by position and hidden state. A regression test ensures the symbol is absent until revealed; matched and revealed cards receive their appropriate labels.
- **Navigation and headings:** Home, Settings, Install and game route changes now move focus to the new screen heading, which has a visible focus indicator. Settings section headings now follow the page heading with level-two headings.
- **Progress protection:** starting a Noughts & Crosses round with moves now asks before replacing it. The safe action is first in the dialog. A new game in other games continues to use its existing confirmation flow.
- **Simple Mode:** the derived settings now also hide non-essential move counts and game statistics in Rules without changing saved individual preferences. Noughts & Crosses and Fifteen Puzzle honor that setting, including completion copy.
- **Time to understand feedback:** Pairs keeps mismatched cards visible for 2.2 seconds and a hinted card visible for 3 seconds. Reduced Motion does not shorten these intervals. Word Search hints remain visible for 4 seconds. Solitaire invalid-move feedback stays until the next interaction rather than disappearing almost immediately.
- **Keyboard instructions:** Solitaire help now explains selecting cards and destinations with Tab, Enter and Space. Its horizontally scrollable tableau is a labelled, focusable region whose scrolling tip is included in its accessible description. Noughts & Crosses help explains reaching and playing squares by keyboard.
- **Touch and zoom:** Word Search now allows vertical page scrolling and pinch zoom to begin on the grid. Tap-start/tap-end selection remains available alongside drag selection, so a drag is not required.
- **Install/update feedback:** Existing buttons and status regions use native controls and labels. The update notice is deferred while a game screen is open, then shown from Home or Settings.
- **Settings semantics:** settings are grouped with fieldsets, legends, native labelled checkboxes and pressed-state buttons. The Solitaire stock-draw choices now have an explicit group name.

## Areas reviewed

- Native landmarks, heading levels, button names, form labels, dialog names/descriptions, and live-region use.
- Keyboard-capable controls across every game. Sudoku and Word Search provide arrow-key grid movement; game actions otherwise use buttons. Fifteen Puzzle instructions identify Tab, Enter and Space. Solitaire supports selecting cards and destinations without dragging.
- Selected, found, matched, given, mistake, winning and hint states. They include text, symbols, underlines, borders or distinct shapes in addition to color. Sudoku mistakes are exposed only when mistake checking is enabled. Word Search does not announce target locations before a find.
- Simple Mode, system/user reduced-motion handling, persistent settings, text-size scaling, browser zoom configuration and game-surface overrides.
- Major text/focus color pairs in the default, dark and game-surface palettes. Sample calculated text ratios were: light body text 13.93:1; muted text 6.10:1; dark theme text 11.04:1; primary button 9.54:1; Solitaire felt text 6.45:1; Noughts cross 9.08:1; Noughts nought 6.84:1. Sample focus ratios were: light focus/app background 7.79:1; dark focus/panel 9.71:1; High Contrast black/white 21:1; Word Search focus/paper 8.94:1. These samples do not constitute a complete contrast scan of every state.
- Shared modal implementation: labelled dialog/alert-dialog, modal state, initial focus, Tab containment, Escape when dismissal is allowed, and focus restoration. Destructive dialogs put the keep/cancel action first.

## Remaining manual/device checks

- The browser tooling available for this review exposed a 710 CSS-pixel viewport but could not set exact widths or perform reliable physical keyboard input. Exact 320/375px, 200–400% zoom and hardware touch checks remain outstanding.
- No screen reader was available. The browser accessibility tree and DOM labels were inspected, but NVDA, VoiceOver and TalkBack announcements, especially grid navigation and dialog transitions, still need hands-on verification.
- High Contrast, Simple Mode, Extra Large UI, OS Reduced Motion and alternate themes were checked in source and shared-setting logic; visual comparison on real devices remains outstanding.
- No automated accessibility scanner was already installed. No large browser-testing dependency was added. This review does not claim formal WCAG conformance.
