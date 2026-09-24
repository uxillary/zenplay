# ZenPlay — Project Context

## Project Summary

**ZenPlay** is a calm, privacy-first collection of familiar games designed to be easy to see, easy to understand, and easy to use.

The project exists as an alternative to the large number of mobile and web game collections that are overloaded with adverts, manipulative monetisation, confusing interfaces, timers, streak pressure, unnecessary accounts, and inaccessible controls.

ZenPlay should feel immediately familiar to people who already know the games, while also being significantly easier to use for older adults, people with reduced vision or dexterity, people who prefer simpler interfaces, and anyone who wants a quieter game experience.

The product should **not** feel clinical, patronising, childish, or like a special-purpose "elderly app."

The goal is simply to make **really good, recognisable versions of classic games**, with accessibility and calm interaction built in from the start.

---

# Product Positioning

## Core Proposition

> **Classic games. Easy to see. Easy to understand. No adverts. No pressure.**

ZenPlay should be:

- Familiar
- Calm
- Accessible
- Private
- Ad-free
- Offline-friendly
- Predictable
- Polished
- Respectful
- Easy to return to

The experience should prioritise usability over novelty.

Recognition itself is an accessibility feature.

A Solitaire game should look like Solitaire.

Sudoku should look like Sudoku.

Dice should look like dice.

Cards should look like traditional playing cards.

Word Search should resemble the printed puzzle format people already recognise.

ZenPlay should modernise the **implementation**, not unnecessarily reinvent the games.

---

# Product Principles

| Principle | Meaning |
| --- | --- |
| **Familiar** | Games behave the way people already expect them to behave. |
| **Tap-first** | Dragging is never required to complete a game. |
| **Readable** | Large text, game pieces, cards, numbers, and controls are supported throughout. |
| **Predictable** | Navigation and primary controls remain in consistent locations. |
| **Offline** | Core games should work without an internet connection after installation/loading. |
| **Ad-free** | No banners, interstitials, rewarded ads, or "watch this to continue" mechanics. |
| **Private** | No account should be required for ordinary play. |
| **Accessible** | Keyboard, screen reader, zoom, high contrast, reduced motion, and large touch targets are first-class requirements. |
| **Calm** | No unnecessary countdowns, streak pressure, urgency, excessive celebration, or notification pressure. |
| **Fair** | Payment may add optional content or cosmetics, but never restore usability or core gameplay that was deliberately withheld. |

---

# Product Promise

ZenPlay should be able to truthfully communicate:

> **No ads. No accounts. No tracking. Just games.**

Core gameplay should remain completely playable without payment.

Optional monetisation must never undermine this promise.

---

# Current Technical Foundation

The existing project is intentionally small and provides a clean base for expansion.

## Current stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- `vite-plugin-pwa`

## Current product state

The current MVP contains **Klondike Solitaire** and includes:

- Installable PWA
- Offline app-shell support
- No backend
- No accounts
- No external APIs
- No tracking
- Persistent settings via local storage
- Light and dark themes
- High contrast mode
- Large cards mode
- Reduced motion
- Handedness setting
- Tap-to-move interaction
- Undo
- Pure Solitaire game logic
- Calm win modal:
  - **"You did it."**

The existing codebase should be evolved rather than rewritten unnecessarily.

---

# Target Audience

ZenPlay should primarily serve people who value simplicity and familiarity.

Likely audiences include:

- Older adults
- People with reduced vision
- People with reduced dexterity
- People who find modern mobile games overwhelming
- People who dislike advertising
- People who prefer traditional game presentation
- People who want games that work offline
- Families setting up games for parents or grandparents
- Care environments
- Neurodivergent users who benefit from predictable, low-noise interaction
- Anyone wanting a calm game collection

The brand should never describe users in a patronising way.

Avoid messaging such as:

- "Games for old people"
- "Senior mode"
- "Easy enough for grandma"
- "Simplified for the elderly"

Instead, focus on benefits:

- Clear
- Familiar
- Comfortable
- Calm
- Easy to use
- Easy to see

---

# Experience Direction

## Desired feeling

ZenPlay should feel:

- Warm
- Traditional
- Trustworthy
- Quiet
- Friendly
- Polished
- Reassuring
- Modern underneath, familiar on the surface

It should **not** feel:

- Clinical
- Medical
- Corporate
- Childish
- Hyper-gamified
- Casino-like
- Flashy
- Manipulative
- Noisy
- Cheap

---

# Visual Direction

Accessibility does not require a hospital-style beige interface.

The preferred direction is:

- Warm cream or off-white surfaces
- Deep green
- Traditional card-table green
- Charcoal text
- Traditional red and black card suits
- Warm neutral accents
- Subtle wood-inspired tones where appropriate
- Clear borders
- Strong focus states
- Restrained rounded corners
- Minimal decorative animation

Games should preserve their traditional visual language.

Examples:

- Solitaire: green felt + traditional playing cards
- Sudoku: clean paper/newspaper-inspired grid
- Word Search: printed puzzle feeling
- Dice games: visually recognisable dice
- Pairs: clear image cards

---

# Interaction Philosophy

## Tap-first

Every game should be fully playable without dragging.

Dragging may be supported where useful, but it must never be mandatory.

Examples:

### Solitaire

- Tap a card or stack
- Tap a valid destination
- Optional double-tap to move to foundation

### Word Search

Support:

- Drag across a word
- Or tap the first letter and then the final letter

### Pairs

- Tap card
- Tap second card

This reduces motor precision requirements and makes touch use more reliable.

---

# Consistent Game Shell

Every game should use a shared interaction structure.

Core controls should appear in predictable positions.

Example shared controls:

- Back / Home
- New Game
- Undo
- Hint
- Rules / Help
- Settings

Controls should not jump around between games unless a game genuinely requires a different layout.

Users should be able to learn ZenPlay itself once.

---

# Accessibility System

Accessibility should become a shared architectural system rather than a collection of isolated game settings.

## Display Settings

### Text size

Options:

- Normal
- Large
- Extra Large

### Game piece size

Options:

- Normal
- Large

Where appropriate, individual games may expose additional scaling.

### Contrast

Options:

- Standard
- High Contrast

### Theme

Options:

- Light
- Dark
- System

---

# Interaction Settings

## Reduced motion

When enabled:

- Remove unnecessary card movement
- Avoid large transitions
- Avoid bouncing
- Avoid confetti
- Avoid celebratory screen motion
- Reduce panel animation

Motion should communicate state, not decorate everything.

## Input style

Possible preference:

- Tap
- Drag + Tap

Regardless of selection, tap interaction should remain supported.

---

# Assistance Settings

Potential shared preferences:

- Hints enabled
- Confirm destructive actions
- Auto-finish where appropriate
- Sound
- Haptic feedback where supported

Sounds should be subtle and optional.

The default experience should not depend on sound.

---

# Simple Mode

A major ZenPlay feature should be **Simple Mode**.

Simple Mode allows someone to configure ZenPlay once and make the entire application easier to operate.

When enabled, it should favour:

- Larger text
- Larger controls
- Larger game pieces
- Maximum clarity
- Stronger contrast
- Reduced motion
- Fewer decorative elements
- Reduced non-essential statistics
- Simpler wording
- Confirmation before abandoning a game
- Consistent Back/Home placement
- Minimal nested navigation
- Reduced visual clutter

Simple Mode should not remove core gameplay.

It should simplify presentation and interaction.

This may be particularly useful when a family member configures ZenPlay for another person.

---

# Cognitive Accessibility

ZenPlay should follow principles that also benefit users with memory difficulties, cognitive impairment, or dementia, without marketing itself as a medical application.

Important rules:

## Keep controls stable

Do not reposition familiar controls between screens or between sessions.

## Avoid hidden gestures

Important functionality must be visible.

## Avoid surprise changes

Do not suddenly rearrange the board or UI without clear feedback.

## Use plain language

Prefer:

- New game
- Continue
- Hint
- Undo
- Settings
- Back

Avoid unnecessary jargon.

## Confirm destructive actions

Examples:

- Starting a new game while one is active
- Resetting settings
- Deleting local history

## Keep celebrations calm

Avoid:

- Confetti explosions
- Loud fanfare
- Streak flames
- Flashing effects
- "YOU'RE AMAZING!!!"

Prefer:

> **Game complete**

or:

> **You did it.**

---

# Launch Game Strategy

ZenPlay should not launch with a huge number of unfinished games.

The priority is a small collection of **high-quality, recognisable, fully usable games**.

A target of approximately **5–7 polished games** is preferable to 20 weak ones.

---

# Core Launch Games

## 1. Solitaire

Klondike Solitaire should become the reference implementation for quality and accessibility across ZenPlay.

Potential launch-complete functionality:

- Draw 1
- Draw 3
- Undo
- Hint
- New Game
- Auto-save
- Resume
- Tap-to-move
- Double tap to foundation
- Optional drag
- Auto-finish when no decisions remain
- Win detection
- Optional move counter
- Optional timer
- Rules / instructions
- Statistics
- Large Print card option
- Jumbo Index card option
- Keyboard support
- Screen reader state announcements

The default presentation should remain traditional and instantly recognisable.

---

## 2. Sudoku

Sudoku is highly suitable for ZenPlay.

Features:

- Easy
- Medium
- Hard
- Large digits
- Large number pad
- Pencil notes
- Undo
- Hint
- Highlight selected row and column
- Optional mistake highlighting
- Pause / resume
- Auto-save
- No timer pressure by default
- Keyboard support
- Accessible grid semantics where feasible

The layout should resemble familiar newspaper and puzzle-book Sudoku.

---

## 3. Word Search

Word Search fits the ZenPlay audience well.

Features:

- Large text option
- Theme-based puzzle sets
- Swipe selection
- Tap-first-letter + tap-last-letter alternative
- Completed word highlighting
- No time limit
- Optional easier mode:
  - horizontal and vertical words only
- Resume current puzzle
- Clear word list
- High contrast highlights
- Keyboard-accessible alternative where practical

Potential included themes:

- Everyday objects
- Gardening
- Animals
- Food
- Britain
- Nature
- Music

---

## 4. Pairs / Memory

A traditional memory matching game.

Possible deck themes:

- Everyday objects
- Animals
- Flowers
- Vehicles
- Playing cards
- Food
- Nature

Difficulty choices might include:

- 6 pairs
- 8 pairs
- 12 pairs
- 18 pairs

Features:

- Large cards
- Calm transitions
- No countdown
- No urgency
- Resume game
- Simple win state

---

## 5. Noughts & Crosses

A small but extremely familiar game.

Modes:

- Player vs computer
- Two players on one device

Difficulty:

- Easy
- Normal
- Hard

This also creates a foundation for local shared-device multiplayer.

---

## 6. Fifteen Puzzle

Classic sliding number puzzle.

Example:

```text
 1   2   3   4
 5   6   7   8
 9  10  11  12
13  14  15
```

Design goals:

- Huge numbered tiles
- Strong contrast
- Tap-to-move
- No timer required
- Clear solved state
- Optional move count
- Resume game

---

# Strong Candidates After Launch

## Dice / Yahtzee-style Game

This could be an excellent ZenPlay addition.

Presentation should resemble:

- Large physical dice
- Familiar paper-style scorecard
- Clear Hold controls
- Large scoring categories

Avoid casino-style presentation.

## Chess

Potentially valuable but should not be rushed.

Needs:

- Correct rules
- Accessible board navigation
- Good move highlighting
- Suitable computer opponent
- Clear notation/help

## Crosswords

Good audience fit, but content creation and clue quality create additional complexity.

## Mahjong-style Solitaire

Potentially excellent, but accessibility and tile recognition must be handled carefully.

---

# Games to Avoid Rushing

Some games are deceptively complex.

Do not add them simply to inflate the game count.

Examples:

- Chess
- Crosswords
- Mahjong
- Backgammon
- Checkers with multiple rule variants
- Large trivia systems

They should only ship once they meet the same completeness standard as Solitaire.

---

# Saving and Persistence

ZenPlay should automatically save progress.

The user should not need to understand or operate a manual save system.

Opening ZenPlay should allow:

> **Continue Solitaire**

or:

> **Continue Sudoku**

Potential persisted data:

- Active games
- Game state
- Settings
- Statistics
- Last-played game
- Favourite games
- Completed puzzles
- Optional theme preferences

As ZenPlay expands, persistence should move toward **IndexedDB** rather than relying entirely on localStorage.

No cloud account should be required.

---

# Statistics

Statistics can exist but must remain optional and low-pressure.

Good statistics:

- Games played
- Games completed
- Current game
- Best move count
- Average completion time where relevant
- Puzzles completed

Avoid pressure mechanics:

- Daily streaks
- Missed-day warnings
- "Don't lose your streak"
- Competitive rank
- Artificial leagues
- Countdown rewards

Statistics should be informational, not manipulative.

---

# Notifications

ZenPlay should not rely on notifications for engagement.

Avoid:

- "We miss you!"
- "Your streak is about to expire!"
- "Come back for today's reward!"

If notifications are ever introduced, they must be:

- Fully optional
- User-requested
- Functional rather than manipulative

---

# Monetisation Philosophy

ZenPlay may include optional purchases, but the entire core product must remain genuinely playable for free.

## Primary rule

> **Never sell relief from an annoyance ZenPlay deliberately created.**

Do not create problems and then charge users to remove them.

---

# Prohibited Monetisation

ZenPlay should never use:

- Banner adverts
- Interstitial adverts
- Rewarded adverts
- Pay-to-remove-ads
- Lives
- Energy
- Coins required for core play
- Paid hints
- Daily play limits
- Game-over paywalls
- Forced subscriptions for basic games
- Loot boxes
- Random paid rewards
- Artificial waiting timers
- Aggressive shop popups

---

# Free Experience

The free product should include:

- Core games
- Unlimited play
- Offline play
- Accessibility features
- Undo
- Hints
- Game saving
- Resume
- No adverts
- No account requirement
- No payment requirement

Accessibility must never be paywalled.

---

# Optional Monetisation Ideas

## Appearance Packs

Small optional cosmetic purchases.

Examples:

### Card Table Packs

- Classic Green
- Burgundy
- Navy
- Warm Wood

### Playing Card Packs

- Classic
- Large Print
- Jumbo Index
- Minimal

### Sudoku Themes

- Paper
- Newspaper
- Chalkboard
- Soft Contrast

These should never improve gameplay advantage.

---

# Optional Puzzle Packs

Word Search and similar content-based games could support optional themed collections.

Examples:

- British Wildlife
- Gardening
- Classic Cinema
- Scotland
- Christmas
- Seaside
- Music
- Football
- 1950s
- 1960s
- 1970s

The base game should still include a generous amount of free content.

---

# Support ZenPlay

A voluntary support model strongly matches the project values.

Example:

> **Support ZenPlay**
>
> ZenPlay is free and doesn't contain advertising. If you'd like to support its development, you can.

Potential contribution levels:

- £2 — Thank you
- £5 — Supporter
- £10 — Big Supporter

Optional cosmetic acknowledgement may be included.

No gameplay advantage should be attached.

---

# Potential Future Product: ZenPlay Family

A future optional product could allow a family member or carer to configure a ZenPlay installation more easily.

Potential features:

- Choose visible games
- Configure Simple Mode
- Set preferred difficulty
- Set text size
- Set game piece size
- Hide unwanted complexity

This should be approached carefully.

Avoid turning ZenPlay into a surveillance system.

A local-first configuration model is preferable where possible.

---

# Privacy

Privacy is part of the product value.

Current direction:

- No account required
- No backend required for core gameplay
- No gameplay tracking
- No advertising tracking
- Local game state
- Offline capability

If analytics are added to a public marketing website, they should remain separate from gameplay where possible.

The app itself should preserve the strongest practical interpretation of:

> **No tracking.**

---

# Shared Product Architecture

The current game-oriented architecture should evolve into a shared platform.

Suggested structure:

```text
src/
  app/
    App.tsx
    routes.ts
    gameRegistry.ts

  accessibility/
    AccessibilityProvider.tsx
    preferences.ts

  components/
    GameCard.tsx
    GameShell.tsx
    GameToolbar.tsx
    ConfirmDialog.tsx
    SettingsPanel.tsx

  games/
    solitaire/
      model/
      ui/
      tests/

    sudoku/
      model/
      generator/
      ui/
      tests/

    pairs/
      model/
      ui/
      tests/

    word-search/
      model/
      generator/
      ui/
      tests/

    noughts-crosses/
      model/
      ui/
      tests/

    fifteen/
      model/
      ui/
      tests/

  persistence/
    database.ts
    gameSave.ts
    statistics.ts

  styles/
```

---

# Game Architecture

Each game should ideally have:

1. **Pure game model**
2. **Rules / validation**
3. **UI**
4. **Accessibility behaviour**
5. **Persistence serializer**
6. **Tests**

Game rules should not be tightly coupled to React components.

This makes games easier to:

- Test
- Save
- Restore
- Debug
- Reuse
- Adapt for accessibility

---

# Game Registry

ZenPlay should eventually use a shared game registry rather than hard-coded home-screen game buttons.

Example responsibilities:

- Game ID
- Name
- Description
- Icon
- Route
- Availability
- Continue-state support
- New-game action
- Accessibility capabilities

This allows the home screen and future navigation to scale cleanly.

---

# Home Screen Direction

The current single-game home should evolve into a clear game library.

Concept:

```text
┌────────────────────────────────────────────┐
│ ZenPlay                         ⚙ Settings │
│                                            │
│ Choose a game                              │
│                                            │
│ ┌───────────────┐ ┌───────────────┐       │
│ │      🂡       │ │      123      │       │
│ │   Solitaire   │ │    Sudoku     │       │
│ │ Classic cards │ │ Number puzzle │       │
│ └───────────────┘ └───────────────┘       │
│                                            │
│ ┌───────────────┐ ┌───────────────┐       │
│ │     ABC       │ │      🐶       │       │
│ │  Word Search  │ │     Pairs     │       │
│ └───────────────┘ └───────────────┘       │
│                                            │
│ Continue: Solitaire                        │
└────────────────────────────────────────────┘
```

Desktop and tablet:

- Multiple columns

Mobile:

- One large game card per row where necessary

Avoid hiding primary navigation in hamburger menus unless absolutely necessary.

---

# Installation Experience

ZenPlay should remain installable as a PWA.

Installation should be:

- Clearly explained
- Optional
- Easy to dismiss
- Available again later
- Platform-aware where practical

The installation experience should not interrupt gameplay repeatedly.

---

# Offline Behaviour

ZenPlay should work reliably offline once installed or previously loaded.

Important areas:

- App shell
- Game logic
- Puzzle data
- Saved games
- Settings
- Theme assets
- Card assets
- Help content

Optional purchases may require connectivity, but purchased local content should ideally remain usable offline.

---

# Accessibility Quality Bar

ZenPlay should be tested against more than visual appearance.

Launch testing should include:

## Keyboard-only

Users should be able to:

- Navigate the application
- Select games
- Operate settings
- Play supported games
- Open/close dialogs
- Start a new game
- Undo
- Request help

## Screen reader

Ensure:

- Buttons have meaningful labels
- Dialogs announce correctly
- Game state changes are announced where practical
- Visual-only information has equivalents
- Focus order is logical

## Zoom

Test browser zoom levels such as:

- 200%
- 300%
- 400%

Important controls must remain usable.

## Touch targets

Use generously sized touch targets.

Do not rely on tiny icon-only buttons.

## Contrast

Text, borders, game pieces, selection states, and focus indicators must remain distinguishable.

## Reduced motion

Respect system preference and ZenPlay preference.

---

# Language and Copy

Copy should be calm and direct.

Prefer:

- Choose a game
- Continue game
- New game
- Undo
- Hint
- Settings
- Game complete
- You did it.
- Play again
- Back to games

Avoid:

- Hyperactive achievement language
- Technical jargon
- Excessive tutorials
- Marketing inside gameplay

---

# Help and Rules

Every game should include easily accessible rules.

Help should:

- Use plain language
- Be concise
- Use diagrams where genuinely useful
- Explain controls separately from game rules
- Avoid assuming prior digital-game experience

Example sections:

- How to play
- How to move pieces
- What the buttons do
- Winning the game

---

# Launch Quality Standard

A game should not be considered complete merely because its basic rules work.

A launch-ready ZenPlay game should have:

- Correct rules
- New game
- Win/loss detection where relevant
- Save/resume
- Undo where appropriate
- Hint where appropriate
- Keyboard support
- Touch support
- Accessibility settings integration
- Help
- Responsive layout
- Error-state handling
- Reduced-motion support
- High-contrast support
- Large-size support
- Testing
- Polished empty/loading/completion states

---

# Development Roadmap

## M01 — Product Foundation

Goal:

Create the shared ZenPlay application foundation before adding more games.

Work:

- Refine navigation
- Redesign home screen
- Introduce game registry
- Introduce shared GameShell
- Introduce shared GameToolbar
- Establish design tokens
- Establish consistent buttons/dialogs
- Establish predictable game layout
- Refine responsive behaviour

---

## M02 — Accessibility Foundation

Goal:

Make accessibility a shared system.

Work:

- Accessibility provider
- Text-size system
- Game-piece-size system
- High contrast
- Reduced motion
- Theme support
- Keyboard focus standards
- Screen reader patterns
- Confirm-destructive-action setting
- Simple Mode

---

## M03 — Solitaire Completion

Goal:

Turn existing Solitaire into a genuinely launch-quality reference game.

Work may include:

- Review Klondike rules
- Draw 1 / Draw 3
- Improved tap movement
- Optional double-tap foundation
- Hint
- Auto-finish
- New-game confirmation
- Resume
- Statistics
- Large Print / Jumbo Index cards
- Full keyboard review
- Screen reader improvements
- Responsive improvements
- Rules/help
- Better end-game behaviour

---

## M04 — Persistence

Goal:

Create reliable game-state persistence shared across games.

Work:

- IndexedDB
- Versioned save schema
- Game serializers
- Auto-save
- Continue game
- Migration handling
- Statistics storage
- Corruption fallback
- Local-only operation

---

## M05 — Sudoku

Goal:

Ship the second major polished game.

Work:

- Puzzle generation / validated puzzle library
- Difficulty levels
- Pencil marks
- Undo
- Hint
- Highlighting
- Save/resume
- Accessible input
- Keyboard support
- Help
- Statistics

---

## M06 — Pairs

Goal:

Ship a simple, polished memory game.

Work:

- Difficulty sizes
- Accessible image sets
- Calm flipping animation
- Reduced-motion alternative
- Save/resume
- Theme support
- Keyboard/touch control

---

## M07 — Word Search

Goal:

Ship a highly accessible word game.

Work:

- Puzzle generation
- Puzzle validation
- Theme packs
- Swipe selection
- Tap-start/tap-end selection
- Large text
- Easier direction mode
- Save/resume
- Accessible completion feedback

---

## M08 — Noughts & Crosses + Fifteen Puzzle

Goal:

Add two smaller, highly polished familiar games.

Noughts & Crosses:

- Local multiplayer
- Computer opponent
- Difficulty

Fifteen Puzzle:

- Valid shuffled boards
- Tap movement
- Move counting
- Resume

---

## M09 — PWA / Offline / Install Polish

Goal:

Make ZenPlay feel like a reliable installed app.

Work:

- App icons
- Manifest
- Install experience
- Offline validation
- Update handling
- Safe cache refresh
- Standalone layout review
- Mobile browser review

---

## M10 — Accessibility Audit

Goal:

Audit the entire product rather than assuming accessibility is complete.

Test:

- Keyboard-only
- Screen readers
- Browser zoom
- Touch
- Contrast
- Reduced motion
- Focus order
- Dialogs
- Large text
- Simple Mode
- Portrait/landscape
- Smaller phones
- Tablets
- Desktop

Use WCAG guidance where applicable.

---

## M11 — Launch Polish

Goal:

Prepare the complete product for public release.

Work:

- Final UX review
- Rules/help
- About page
- Privacy explanation
- Offline explanation
- Install explanation
- Error handling
- App metadata
- Icons
- Social/share metadata
- Website copy
- SEO
- Browser testing
- Device testing
- Performance review

---

## M12 — Optional Purchases / Support

Goal:

Add monetisation only after the core product is excellent.

Possible work:

- Support ZenPlay
- Theme purchases
- Card packs
- Puzzle packs
- Restore purchases
- Clear purchase explanation
- Offline entitlement handling

Core gameplay and accessibility must remain free.

---

# Development Priorities

When deciding what to build next, prioritise:

1. Correct gameplay
2. Accessibility
3. Familiarity
4. Clear controls
5. Persistence
6. Reliability
7. Responsive layout
8. Help/documentation
9. Visual polish
10. Additional games
11. Monetisation

Do not prioritise the store before the games.

---

# Scope Discipline

ZenPlay should resist feature creep.

Do not add:

- Social feeds
- Global leaderboards
- Chat
- Daily reward systems
- Aggressive achievements
- Battle passes
- Competitive ranking systems
- AI features without a clear accessibility benefit
- Accounts merely for engagement metrics

A feature should have a clear reason to exist.

---

# Product North Star

> **ZenPlay is a collection of familiar, accessible games designed to be calm and easy to use. Games are fully playable without adverts, accounts, timers, or purchases. Accessibility is built into every game rather than added afterwards. Optional purchases support ZenPlay and add cosmetic or additional content, never basic usability or core gameplay.**

---

# Launch Philosophy

ZenPlay should win through trust.

A user should be able to recommend it to a parent, grandparent, friend, or relative without needing to warn them about:

- Ads
- Scammy purchase prompts
- Subscription traps
- Strange permissions
- Accounts
- Confusing controls
- Tiny interfaces

That trust is part of the product.

ZenPlay should not attempt to maximise the amount of money extracted from each user.

It should aim to become the game app people keep because:

> **It simply lets them play.**
