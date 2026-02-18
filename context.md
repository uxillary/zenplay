# ZenPlay — context for Codex

ZenPlay is a calm, ad-free, nana-proof games suite focused on accessibility and trust. The first game is Klondike Solitaire.

Primary audience:

- Elderly users and less tech-confident users.
- Secondary: family/carers setting up devices for them.

Core promise:

- No ads. No tracking. No accounts. No “gotcha” popups. No dark patterns.
- Big readable UI, tap-friendly, calm visual design.
- Offline-friendly: works without internet once installed.
- Designed to be “nana proof”: minimal confusion, forgiving interactions, obvious buttons.

Business direction (later):

- Start as free or one-time purchase style product; possible later expansion into a “Senior Safe Mode” launcher ecosystem.
- For now: ship a rock-solid Solitaire PWA, then wrap for Android.

Non-goals (for MVP):

- No online multiplayer.
- No leaderboards.
- No data collection, analytics, tracking pixels, ads SDKs, or external marketing scripts.
- No complex 3D effects, no flashy animations that could confuse users.

---

## Tech stack & constraints

Use:

- Vite + React + TypeScript
- Tailwind CSS
- PWA support using `vite-plugin-pwa` (offline caching)
- No backend required for MVP.
- Keep dependencies minimal.

Target devices:

- Android tablets / phones
- iPads later (web first means it runs anywhere)
- Mouse + keyboard should still work (desktop web)

Performance:

- Should feel instant on cheap tablets.
- Avoid heavy libs, large images, and unnecessary animations.

Accessibility:

- High contrast option
- Large cards option
- Big buttons, big hit areas
- Simple readable typography
- Avoid relying solely on color to convey state
- Optional “Reduced motion” mode

Privacy:

- No telemetry. No user tracking. No external calls except optional font loading (prefer system fonts to avoid network dependency).
- LocalStorage only for settings and last-used options.

---

## Branding & tone

Name: ZenPlay
Style: calm, modern, not childish, not “corporate”.
Vibe: “quiet confidence” — like a well-designed remote control: obvious, reliable, minimal.

Color guidance:

- Neutral dark + light options. Keep contrast high.
- Avoid neon/glow. Avoid busy gradients.
- The UI should look “safe” and “clean.”

Copy tone:

- Friendly and simple. Never patronising.
- Use plain language: “New Game”, “Undo”, “Hint”, “Settings”.
- Avoid jargon.

---

## Product requirements (MVP)

### App shell

- Home screen with one large tile: “Solitaire”
- Settings accessible globally:
  - Theme: Light / Dark
  - High contrast: On/Off
  - Large cards: On/Off
  - Reduced motion: On/Off
  - Sound: On/Off (optional for later)
  - Handedness: Right / Left (moves primary action buttons)
- Persistent settings using localStorage.

### PWA / install

- Works offline after first load.
- Provide an in-app “Install ZenPlay” helper page with step-by-step instructions for Android Chrome:
  - “Tap the three dots”
  - “Add to Home screen”
  - “Open from your new icon”
- Do not show nag popups. Use a gentle optional prompt.

---

## Solitaire requirements (MVP = Klondike)

Game: Klondike Solitaire (classic).

Rules:

- Standard 52-card deck
- Tableau: 7 piles; 1 face-up on first pile, 2 on second, ... 7 on seventh
- Stock + Waste
- Foundations: 4 piles by suit A→K
- Tableau builds down alternating colors
- Empty tableau accepts King only
- Stock deal: support both:
  - Draw 1 (default)
  - Draw 3 (toggle in-game settings)

Controls (IMPORTANT: nana-proof):

- Start with TAP-TO-MOVE controls (not drag first):
  - Tap a card (or stack) to select
  - Valid destinations highlight
  - Tap destination to move
  - Tap elsewhere to cancel
- Provide big buttons:
  - New Game
  - Undo
  - Hint (optional simple hint)
  - Deal (tap stock)
- Drag-and-drop can be added later as an enhancement, but MVP should be tap-first.

UX guidance:

- Large tap targets.
- Clear selected state.
- Clear “no move” feedback (subtle, not scary).
- Animations minimal; respect reduced motion.
- Avoid clutter. One screen, no scrolling.

Undo:

- Implement at least 1-step undo; ideally multi-step with a move history stack.

Game completion:

- Detect win and show a calm congratulation modal:
  - “You did it.”
  - Button: “New Game”
  - No confetti overload.

Optional (nice-to-have, still MVP-friendly):

- Auto-move to foundation toggle (off by default) OR a gentle “Auto-finish” when clearly safe.

---

## Code architecture guidance

- `src/games/solitaire/` contains all solitaire logic + UI.
- Keep game logic pure and testable:
  - deck shuffling, dealing, move validation, win detection
- UI components should be small and reusable:
  - Button, Modal, Toggle, CardView, PileView
- Use TypeScript types for cards and piles.

Suggested structure:

- `src/games/solitaire/model/`:
  - types.ts (Card, Suit, Rank, Pile types)
  - rules.ts (move validation)
  - engine.ts (apply move, undo stack)
  - deal.ts (new game setup)
- `src/games/solitaire/ui/`:
  - SolitaireScreen.tsx
  - Pile components

State management:

- Keep it simple: React state + reducer (useReducer).
- Avoid adding a heavy state library.

---

## Deliverables to generate in repo

1) Working ZenPlay PWA (runs via `npm run dev`)
2) Solitaire MVP playable end-to-end
3) Offline installable PWA with simple install guide page
4) Documentation:
   - README.md: what ZenPlay is, how to run, how to build
   - BUILD_ANDROID.md: placeholder instructions for later Capacitor wrapping

---

## Later: Android wrapping (do not implement unless asked)

Planned approach:

- Capacitor wrapper to create an Android Studio project.
- Steps will go in BUILD_ANDROID.md.
- Keep the web build output in `dist/`.

For now, just ensure the web app is PWA-ready and performs well on Android tablets.

---

## Development commands

Use these scripts:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint` (optional)
- `npm run typecheck` (optional)

---

## Quality bar & testing checklist

Before calling it MVP-complete:

- Can start a new game repeatedly without bugs
- Cannot make illegal moves
- Undo works reliably
- Works offline after first load
- Buttons readable and tappable on a 7–10" tablet
- High contrast + large cards modes are noticeable improvements
- No console spam / errors
- No external network calls besides initial bundle fetch

---

## Notes about tone + visuals

ZenPlay should feel like:

- “A calm safe corner of the internet.”
Not like:
- A casino app.
- A kids app.
- A flashy gamer UI.

Keep it clean, spaced, and obvious.

End of context.
