# ZenPlay

ZenPlay is a calm, privacy-first, tap-friendly games app for older adults and anyone who wants a simple, safe experience. MVP includes **Klondike Solitaire** as an installable **PWA**.

## MVP Principles

- No ads
- No tracking
- No accounts
- No backend
- No external APIs
- Works offline after first load
- Large readable controls and cards

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS
- `vite-plugin-pwa`

## Project Structure

```text
src/
  app/
  components/
  games/solitaire/
    model/
    ui/
  lib/
  styles/
```

## Features Implemented

- Home screen with large **Solitaire** tile
- Global settings with persistence (`localStorage`):
  - Light/Dark theme
  - High contrast
  - Large cards
  - Reduced motion
  - Handedness toggle
- Klondike solitaire engine with pure model logic:
  - Shuffled 52-card deck
  - Tableau + stock/waste + foundations
  - Rule validation
  - Undo stack
- Tap-to-move interaction (no drag required)
- Calm win modal: **“You did it.”**
- PWA manifest + offline app shell caching
- In-app install helper page for Android Chrome

## Run Locally

```bash
npm install
npm run dev
```

## Build and Preview

```bash
npm run build
npm run preview
```

## Quality Checks

```bash
npm run typecheck
npm run lint
```
