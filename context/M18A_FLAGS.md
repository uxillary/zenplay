# M18A Flags

## Architecture and gameplay

Flags is registered in the shared game catalogue and uses the existing history navigation, Home card and `GameShell`. The question generator and country data live in `src/games/flags/model`; `FlagsScreen` owns the current session in memory, as this short, non-resumable game does not need saved-game storage or statistics integration. Classic has ten unique flags, four shuffled choices, gentle answer feedback, an explicit continue action and a final result with replay and return navigation.

## Country inclusion policy

The dataset contains 195 ISO 3166-1 alpha-2 entries corresponding to the 193 UN member states and the two UN observer states (Holy See and State of Palestine). It excludes dependencies, constituent countries and other entities outside this fixed set. ISO membership is the dataset inclusion rule, not an independent assertion about sovereignty or a resolution of political disputes. Display labels are chosen for player familiarity; stable lowercase ISO codes are the data IDs. Regions are broad gameplay groupings, not precise geographic claims.

## Flag source, licence and offline behaviour

M18A initially rendered Unicode regional-indicator emoji from ISO alpha-2 IDs. M18B replaces this platform-font-dependent approach with local SVGs. See `M18B_FLAGS_VISUAL_POLISH.md` for the current artwork source, public-domain note, mapping, and offline details.

## Accessibility

The flag image has a neutral accessible name that invites identification without announcing the country; its emoji glyph is hidden from assistive technology. Country choices are native buttons with visible focus, large touch targets and text labels. Feedback announces both the selected answer and the correct country in a polite live region, while selected and correct options also receive explicit text labels and outlines. Progress is labelled as question N of 10. The player controls when to continue.

## Scope and M18B handoff

M18A implements the Classic loop, local 195-country data, deterministic question generation and focused model/navigation tests. Practice, reverse and region modes, difficulty, timed/streak play, achievements, elaborate statistics, adaptive learning and online features remain deferred. For M18B, review flag rendering consistency across target devices, then add the next agreed mode by reusing the country IDs, local data and question-generation boundary.
