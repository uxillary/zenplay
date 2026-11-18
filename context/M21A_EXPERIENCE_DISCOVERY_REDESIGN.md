# M21A — Experience, homepage and SEO architecture redesign

Date: 2026-11-18 (Europe/London). Status: **AUDIT AND CONCEPTS COMPLETE; OWNER REVIEW REQUIRED BEFORE M21B.**

## 1. Recommendation and scope

Adopt **Classic Games Lounge for the library, Modern Play Studio for gameplay, and a restrained reading-room treatment for Guides**. Retain the existing cream/green identity, familiar game artwork and readable system typography. Give the library recognisable previews, explicit Play/Continue actions and a small returning-player feature. Give games a compact shared header and on-demand Help / Rules. Move expanded teaching, strategy and comparisons to `/guides/`.

The game experience takes priority over editorial word counts. Keep canonical game URLs and useful static HTML; replace permanently expanded rules with an honest, native disclosure that works for everyone. Do not build a second `/play/` URL, crawler-only content or a framework migration.

This pass changes only this report and local review artifacts in [M21A_design_review](M21A_design_review/). No production source, assets, dependencies, saves, configuration or hosted services changed. No commit, branch creation, merge, push or deployment was performed. Continue on `codex/m20b1-seo-vertical-slice`; inspected HEAD is `cd4cdad813b488c00202e16d49080892fd580472`. The pre-existing, untracked `M20C_A_RELEASE_PREFLIGHT.md` is preserved.

M20A, M20B.1, M20B.2, M20C-A and the M20 foundation were read alongside actual shell, runtime, navigation, CSS, all eight game screens, accessibility settings, save queues, metadata, prerender and PWA code. Existing project/accessibility/Solitaire documents informed the review. `context/CODEX.md` references `PROJECT_CONTEXT.md`, which is absent; `context/ZENPLAY_PROJECT_CONTEXT.md` exists but contains historical single-game/no-account passages. Current code, README and the user's current brief govern those superseded details.

## 2. Evidence and responsive audit

### Method and limits

- Fresh local production build, Vite preview and a **disposable headless Edge 157.0.4341.60** profile. No personal browser storage or online account was used. The browser connector could not reach the new loopback preview; the evidence collector reuses the repository's established CDP test approach and runs preview/browser within the same process workflow.
- Nine surfaces (Home and eight game routes) at **320, 360, 390, 430, 768, 1024 and 1440 CSS pixels**: 63 default-dark captures/geometry records. Heights: 568, 640, 844, 932, 1024, 900 and 900 respectively. Desktop emulation with normal scrollbars, not physical handset emulation. A scrollbar takes approximately 15px from content width; numbers are rounded.
- Nine additional light-theme and nine combined-accessibility records at 390px: extra-large UI, large pieces, high contrast, reduced motion and Simple Mode. Seven active Flags question records supplement its initial setup screen: **88 total measurements**. Settings are fixture-only. These combined checks do not establish every preference permutation or 320px large-print acceptance.
- Six existing Rules dialogs opened with native Enter, received focus, closed with Escape and returned focus. Nine no-JavaScript Home/game documents were inspected. Screenshots cover all these states plus eight concept views: **111 JPEGs**. Initial collector attempts needed review-runner fixes (Enter event text, preview middleware ordering); the final complete run passed with zero captured runtime errors or console warnings.
- [results.json](M21A_design_review/results.json) contains measurements, browser identity and checks. [audit.mjs](M21A_design_review/audit.mjs) reproduces them. Screenshots use `{game-id}-{width}.jpg`, `home-{width}.jpg`, `{game-id}-light-390.jpg`, `{game-id}-accessible-390.jpg`, `flags-active-{width}.jpg`, `{game-id}-help-390.jpg` and `{page-id}-nojs-390.jpg` under [screenshots](M21A_design_review/screenshots/).
- Geometry was inspected across the full matrix; visual review concentrated on phone layouts, desktop layouts and accessibility cases. No new physical Android/iOS, native zoom, installed PWA, screen-reader speech, full-game completion, cross-tab save conflict or real two-release upgrade certification is claimed. No Lighthouse/CWV, search traffic, ranking, keyword-volume or competitor measurements were obtained.

### Full width matrix: where play begins

Numbers are Y positions in CSS pixels from page top, before scrolling. Solitaire measures its felt container **including toolbar**; the first card row is lower. Flags measures setup; its actual question is considered separately. Others measure the board/grid itself. A low number alone is not proof of usable gameplay.

| Surface | 320 | 360 | 390 | 430 | 768 | 1024 | 1440 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home: first game card | 374 | 346 | 346 | 346 | 293 | 279 | 215 |
| Solitaire: felt/toolbar | 151 | 151 | 127 | 127 | 174 | 150 | 150 |
| Sudoku: grid | 364 | 314 | 290 | 270 | 238 | 238 | 238 |
| Pairs: cards | 354 | 310 | 310 | 274 | 278 | 278 | 278 |
| Word Search: letters | 409 | 389 | 339 | 316 | 315 | 291 | 291 |
| Noughts & Crosses: board | 468 | 468 | 388 | 388 | 286 | 286 | 286 |
| Fifteen Puzzle: board | 344 | 320 | 234 | 234 | 238 | 238 | 238 |
| Mahjong Solitaire: tiles | 494 | 438 | 402 | 352 | 311 | 291 | 291 |
| Flags Quiz: setup | 236 | 186 | 186 | 162 | 190 | 166 | 166 |

No document-level horizontal overflow was measured in these 88 cases. `AppFrame` uses `overflow-x-hidden`; fitting page width alone therefore cannot prove all descendants, focus rings or enlarged pieces are reachable. Reflow and component-level reachability remain explicit acceptance checks.

### Shared defects and weak decisions

| Finding | Evidence and consequence | Priority / response |
| --- | --- | --- |
| Two instruction systems | `PublicGamePage` permanently renders introduction, `#how-to-play` rules, save/offline text and related links. Six games also have a Rules dialog. Solitaire hides its dialog behind Menu; Mahjong and Flags have no equivalent Rules dialog. | High: one discoverable Help surface, shared stable rule text, dynamic game guidance retained. |
| Header density is uneven | Solitaire alone gets `compactBack` and mobile edge-to-edge shell overrides. At 320px other games wrap a full Back button and title, then introduction and a wrapping toolbar. | High: shared compact game shell; preserve descriptive accessible names and touch areas. |
| SEO displaced interaction | Sudoku's 279px grid begins at 364px in a 568px viewport; Noughts' board starts at 468px. Text is not enormous in word count, but is costly relative to the game on small screens. | High: remove marketing sentences from the active game flow; move rules behind deliberate disclosure. |
| Article tail follows even a short game | At 390px Fifteen's rules begin at Y649, Noughts at Y797, Mahjong at Y672. Paragraphs, extra subheadings and links become the next visual destination immediately after the board. | High: no expanded editorial footer during play; guides accessible inside Help. |
| Home hierarchy favours utilities | Profile, Settings and Install sit before the library. At 320px the first card begins at Y374, leaving 194px of viewport for browsing; eight cards occupy about 1761px below that. | High: compact utility access, short welcome and immediate Play/Continue. |
| No explicit Play on new-player cards | `GameCard` is a linked title/description block. A Continue button appears only after a valid supported save is detected. Static/new-user cards have no action-labelled CTA. | High: visible Play affordance; explicit returning-player state. |
| Dark motifs are faint | `zen-game-card__motif` inherits each fixed accent; dark backgrounds change while accent colours do not. Solitaire, Word Search and other motifs are visually subdued. Only five game-specific accent rules exist; Noughts, Fifteen and Mahjong fall back to green. | Medium: theme-aware preview colours with shape/name differentiation. Decorative motifs are not, by themselves, evidence of a text-contrast failure. |
| Library uses desktop space weakly | `HomePage` remains `sm:grid-cols-2` at 1440px, yielding long wide cards. Motifs are abstract text/OS-dependent emoji, not recognisable game previews. No featured, favourite or recent section exists. | Medium: 3–4 columns where readable, bounded previews, one useful feature. |
| Static/runtime drift risk | Shared components help, but Bootstrap hydrates PublicShell and then replaces it with App. The provider reads preferences only in the runtime tree. Cold-load theme/scale/focus changes can occur even without hydration warnings. | High regression risk: test cold/slow load and stored preferences; do not preload and persist default settings. |
| Existing equivalence test misses its stated matrix | `src/seo/render.test.ts` loops `for (const navigation of [pageRoutes])`: a single array, not each route's navigation. Both trees can agree on an unintended not-found branch. Real browser coverage helps but does not repair that unit-test gap. | High verification fix for M21B: iterate `{ navigation } of pageRoutes`, assert intended identity per route, not equality alone. No test was changed in M21A. |

### Per-game audit

| Game | Mobile evidence | Tablet/desktop evidence | Design response |
| --- | --- | --- | --- |
| Solitaire | Strongest game-first layout. At 390px the table starts Y127; at 320px intro wrapping shifts it to Y151. Toolbar has icons and readable labels. The large felt area is partly an intentional viewport-based surface; do not mistake every empty patch for a defect. Permanent introduction and rules still duplicate Menu → How to Play. | Table capped by the existing 60rem panel, unlike the other games. Cards/long stacks have prior M19 acceptance evidence that must survive. At 1440px rules follow at Y716. | Reuse approved table, card faces, gestures and width stability. Expose Help directly, retain Appearance/Game Options and handedness; remove only redundant shell chrome/copy. |
| Sudoku | At 320px cells are about 30px; at 390px about 38px. New Puzzle/Undo/Hint/Rules wrap, and the number pad sits below the grid: a complete edit requires moving between board and controls. Large-piece mode increases glyphs, not physical cell width; combined accessibility grid starts Y454 at 390px. | At 768px the 639px board runs from Y238 to Y877, with the pad still below. At 1024px controls become a side column and the 640px grid nearly fills the 900px height. This breakpoint produces a meaningful interaction change. | Compact toolbar; investigate an adjacent/compact number pad without losing notes, erase, mistakes or left-handed ordering. Preserve roving focus/number shortcuts. Do not claim 44px cells can fit nine across a 320px screen without scrolling or a separate zoom treatment. |
| Pairs | Easy's 12 cards use three columns and four rows; at 390px cards area is 349×567 at Y310, extending to Y877. Large tap targets are a strength, but the last row and messages require scrolling. Toolbar's Turns value can create another line. | Six columns from 1024px make a much shorter board than tablet's four columns. At 1440px cards grow to about 191px wide, stretching a simple memory game unnecessarily. | Preserve card visibility timing, hidden-card names and size choices. Bound desktop board width. Assess four phone columns as an owner-tested option, not an automatic shrink to fit. Quiet stats should not force a toolbar row. |
| Word Search | Grid starts Y409 at 320px and Y339 at 390px; cells about 32/40px. Title, intro, toolbar, count, theme and helper line precede/follow the grid, while the word list begins well below it. User must scroll to connect targets and letters. | At 768px a 606px grid begins Y315; words remain stacked until the larger breakpoint. Desktop side-by-side layout is better. | Move short essential target list near the board, consider a compact wrapping list above it on phone, and retain readable letters plus tap-endpoint alternative. Remove duplicate permanent instructions, not the words needed to play. |
| Noughts & Crosses | At 320/360px board starts Y468. At 390px title still wraps below Back; mode buttons and Rules take two toolbar rows before turn feedback. A tiny-rules game receives unusually much chrome. | Comfortable 544px board but substantial unused horizontal space inside a wide common panel; mode selection and turn state lack a tighter relationship to the board. | Shared compact title; persistent current-mode label with discoverable Change options; large turn indicator close to board. Preserve computer difficulty, two-player mode, keyboard squares and round replacement confirmation. No Continue promise. |
| Fifteen Puzzle | 390px board starts Y234 and is readable; at 320px wrapped title/toolbar pushes it to Y344. Always-visible instruction repeats intro, Rules and static rules below. | Board is capped at 608px; the surrounding full-width shell/toolbar makes alignment loose. | Keep the recognisable tile board and solvable-puzzle engine. One compact task hint is sufficient; no rules article after it. Retain new-puzzle confirmation and safe focus after moving a tile. |
| Mahjong Solitaire | **Highest usability risk.** At 320px board is 267×156 at Y494 and tile button widths about 14px; 390px about 18×23px; 430px about 20px wide. A fit-to-width 144-tile board is not a comfortable touch experience. Combined large-piece/Simple Mode still produces ~18×22px tile buttons at 390px. | At 768px tiles remain about 33px wide; 1024/1440px about 46/63px. Labels, matched counts and remaining/match totals add rows above the board. No Rules button exists in its toolbar. | M21B must expose Help and measure a larger board viewport with explicit horizontal panning/zoom and preserved tap/arrow selection. Keep the Turtle engine/artwork. No overlapping enlarged hit areas that could select neighbours. Mobile comfort is a stop gate, not a problem solved merely by moving SEO text. |
| Flags Quiz | Setup has deliberate mode descriptions and region choices, which are useful configuration, not SEO filler. At 320px it extends to Y894; Start is below the fold. At 390px the active flag starts Y217 and is 317×248; choices/feedback/end-session continue down the page. There is no in-game Help dialog. | Setup narrows to 576px, but active flag can be 672×378; answer choices remain a long vertical list even on desktop. | Keep real setup; reduce surrounding shell and constrain flag height while preserving aspect/recognition. Add on-demand rules. Consider desktop question/choices columns. Keep correct/incorrect text, learning feedback and deliberate Next; do not hide learning content as if it were SEO. No unfinished-session Continue. |

Representative current evidence: [Home 390](M21A_design_review/screenshots/home-390.jpg), [Home 1440](M21A_design_review/screenshots/home-1440.jpg), [Sudoku 320](M21A_design_review/screenshots/sudoku-320.jpg), [Mahjong 390](M21A_design_review/screenshots/mahjong-390.jpg), [Flags active](M21A_design_review/screenshots/flags-active-390.jpg). Every other route/width has the same naming convention in the evidence directory.

### Accessibility, save and navigation assessment

Positive foundations worth keeping: one H1/main in all measured routes; real Home/game anchors; pathname-authoritative routes; route-heading focus; native buttons; visible focus styling; game labels/live feedback; non-drag alternatives; user-controlled updates; six save-aware Continue loaders. Default controls are generally about 48px high. Compact Solitaire also preserves large action areas while reducing label size.

Measurements below 44px are a **comfort review**, not an automatic WCAG failure: 44px is the proposed product target; WCAG 2.2 AA target-size minimum is 24px subject to exceptions. Inline text links, disabled elements, labels that enlarge checkbox hit areas and spatial game boards require separate evaluation. At 390px Mahjong records roughly 28 enabled small tile targets plus its checkbox/inline link under 24px in at least one dimension. Tile crowding needs a specific assessment; the checkbox's enclosing label enlarges its usable area. Sudoku and Word Search cells exceed 24px in the measured default layouts but often fall below the preferred 44px. Do not generalise page-width success into dexterity acceptance.

Native Enter/Escape checks passed for Solitaire, Sudoku, Pairs, Word Search, Noughts and Fifteen. Solitaire Rules returns focus to Menu because it replaces the menu dialog; the others return to Rules. `GameDialog` has labels, focus containment and restoration, but no explicit background `inert` in source; virtual-cursor/background isolation needs real assistive-technology verification. These checks are not full Tab traversal or screen-reader speech certification.

At combined accessibility settings the 390px Home first card moves from Y346 to Y467; Noughts board from Y388 to Y584 and Word Search from Y339 to Y512. Simple Mode suppresses statistics in runtime screens but **does not simplify the SEO rules tail**. High-contrast screenshots retain black/white shell text, yet custom game surfaces, disabled states, tile labels and focus indicators require per-state review. Preserve system reduced motion and Windows forced colours separately from the app's high-contrast preference.

Continue exists only for Solitaire, Sudoku, Pairs, Word Search, Fifteen and Mahjong. Availability is asynchronous; initial static HTML correctly makes no private save claim. Current generic game entry already restores supported saves, so Play and Continue must not silently become different restart semantics. `pendingWrites.ts` is a read-order barrier across unmounts, not a transactional multi-tab conflict solution or a promise against abrupt termination.

## 3. Shared game-first page specification

### Default page and controls

1. Existing skip link and main landmark. Explicit `/` Back to Games anchor, one game H1 and **Help / Rules** in a compact header area. Visible “Games” is acceptable with accessible name “Back to Games”. Long names wrap without squeezing actions below their touch target.
2. Existing game toolbar and board, then only essential task feedback, choices or inputs. No marketing introduction, expanded rules, related-game carousel or editorial footer before/after the active board. Board geometry follows each game, not one universal fixed-height container.
3. One on-demand Help area containing a short variant identity, goal, controls, keyboard/touch alternatives, save limitations, relevant accessibility options and one or two published guide links. Keep a useful static rules excerpt here; longer teaching belongs to Guides. Keep game-specific statistics/options separate from basic rules where feasible.
4. Save failures/recovery remain prominent alerts; genuine loading/error/offline/update states retain existing behaviour. Do not compact away warnings. No new Play gate for games that currently start immediately. Flags keeps its intentional setup step.

No universal sticky header/bottom dock in M21B: these can occlude boards, browser chrome and zoomed controls. Prefer normal document flow and bounded game surfaces. Explore sticky elements only with evidence and separate device acceptance. At default size, aim for first playable surface by roughly 220px on 320px layouts and 180px on 390px where game-specific setup allows; report per-game exceptions. These are design targets, not permission to shrink cards or text. Measure first playable cells/piles as well as outer containers. At enlarged text, readability/reachability takes precedence over fitting everything above the fold.

Reuse the existing board components and engines. Adapt toolbars narrowly: New/Undo/Hint/Help should be clear and reachable; variants/settings can be grouped under a labelled Game options action with a current-state summary. Keep Solitaire Appearance/Options, Sudoku notes/mistakes, Pairs board sizes, Noughts mode/difficulty, Flags modes/regions and Mahjong tile labels. Avoid icon-only primary controls or dumping every action into an overflow menu.

### Help choices and trade-offs

| Option | Benefit | Cost / risk | Recommendation |
| --- | --- | --- | --- |
| Help dialog | No surrounding page reflow; existing `GameDialog` implementation and familiar game-specific guidance. | Needs JS and accessible modal behaviour; cannot be the only rules surface for no-JS users. Two parallel copies can drift. | Optional enhancement after a disclosure slice passes; not required for M21B. |
| Native `<details><summary>Help / Rules</summary>…</details>` | Keyboard/touch/no-JS support; stable semantic content; closed content consumes only a useful control. Users intentionally reveal it. | Expanded content takes space; summary positioning must be tested with long titles/large print. | **Primary M21B choice**, closed by default for everyone, placed with header/controls and opening into readable document flow. |
| Dedicated guide link only | Cleanest game and good long-form reading. | Leaving play can interrupt unsaved Flags/Noughts rounds; network/offline and extra navigation costs. Weak as immediate control help. | Supplement disclosure, never replace quick controls/rules. |

Use a normal single disclosure first; do not force an overlay or brittle absolute-positioned panel just to achieve an ideal header screenshot. On narrow/large-print layouts its summary may take a second header row. Remove existing duplicate Rules buttons only as each game's Help content/controller is connected; do not remove the sole help access for Mahjong/Flags or discard dynamic instructions/statistics. Avoid duplicate IDs if help components also occur in completion/options dialogs.

### Honest progressive enhancement contract

- Build and first browser render use **the same** H1, Home link, game identity, native Help disclosure/content, guide links (when published) and labelled loading region. Disclosure starts closed in both. No crawler detection, hidden keyword paragraphs, off-screen SEO blocks or JS removal of static rules.
- No-JS users can open Help, read useful instructions, navigate the library/guides and read “Playing games needs JavaScript.” Replace a perpetual “Loading game…” message in the no-JS presentation with that truthful explanation as part of the shared enhancement design; do not imply the game works without scripts. Do not prerender fake/random playable boards.
- After hydration, the current runtime/provider/lazy game mounts. Static identity/rules remain semantically equivalent; private saves, dynamic draw-mode guidance and controls appear only client-side. A saved light/large-print preference can style the shell; never serialize personal settings into public HTML or persist server defaults over storage.
- Opening/closing Help, changing metadata or following a same-page fragment must not remount a board, redeal, reset timer/session or lose pending writes. Native disclosure state should survive the static-to-runtime handoff if opened during a slow load; explicitly test and preserve focus. A modal enhancement, if later chosen, must reference the same rule-body source, preserve fallback and restore focus to its triggering action.
- Guide links are real anchors with ordinary modified/new-tab behaviour. Normal in-app navigation uses the existing controller. Help should make leaving an unsaved Flags/Noughts round clear; it must not auto-open tabs. Reading inline rules leaves play intact. Returning to supported games resumes the same session through existing loaders/barriers.

## 4. Homepage design specification

### Identity, layout and visual system

Keep the ZenPlay name in a more recognisable wordmark, warm paper backgrounds and a deep-green action colour. A modest Georgia/system-serif heading is a Lounge option; system sans remains the default for body, controls and games. No remote fonts. Maintain a polished dark equivalent; **do not change the stored/default theme** as an incidental design decision (current default is dark). No new production logo/artwork in this phase.

Suggested welcome: **“A little time for a good game.”** Supporting copy: “Familiar favourites, at your pace. No adverts. No account needed.” Keep this compact; at 320px use a smaller heading and tighter spacing than the desktop concept. Product copy must remain truthful against the separate hosted analytics decision in M20C-A.

| Element | Specification |
| --- | --- |
| Main width | Approximately 72–76rem max; align wordmark, welcome, cards and quiet Guides row. 12–16px phone gutters; 24–32px desktop. Avoid nested padded panels that consume board/library width. |
| Spacing | 4/8/12/16/24/32px rhythm; 16px phone card gaps, 20–24px desktop. Density comes from fewer redundant regions, not smaller text. |
| Type | Body around 18px with 1.5 line height; controls 16–18px; game titles 20–26px; Home headline 28–36px phone, up to 44–48px desktop. Scale with existing UI preferences; do not encode pixel-only text throughout. |
| Utility navigation | Wordmark then labelled Settings, Profile, Install; 44px minimum product target, preferably 48px. Wrap predictably on phone. Settings remains directly discoverable, not an account menu. Installed state suppresses/relabels Install using existing experience detection; retain static install link before JS. |
| First visit | Compact welcome followed by a modest featured game and the full collection. The feature contains Play Solitaire (or another explicitly selected game), never fictional saved progress. Keep at least one useful action visible without scrolling at 320×568. |
| Returning visit | A **single** “Your saved game” feature when a valid resumable game exists; explicit Continue [game]. Prefer most recently updated valid save; ties use stable catalogue order. If only validity is available initially, use “Saved game”, not “Recently played”. No new tracking or activity-history store is needed. |
| Grid | One column at 320–359px; two from about 360px only while titles/controls fit; three near 768px; four near 1200px. Large/extra-large UI and Simple Mode may choose fewer columns based on usable card width. Verify boundaries rather than relying solely on device names. |
| Card preview | Bounded 80–120px phone / 120–150px desktop area with recognisable numbers/cards/letter/tile arrangements using existing components/assets or simple code-native shapes. No live engine per card, random deals, giant raster images, automatic animation or unapproved artwork. Decorative preview gets `aria-hidden`; game title/action names carry meaning. |
| Card content | Heading with exact game name, one useful short description, explicit Play [game] link. For a valid save show Continue [game] as primary; New game remains a confirmed game-level action, never a destructive library link. Plain Play means open the game, which may restore a save. |
| Link model | Prefer a single card anchor whose visual CTA says Play/Continue, avoiding two identical adjacent keyboard stops or nested interactive elements. If a separate guide link is later needed, it is a sibling, never nested inside the game link. |
| Differentiation | Theme-aware felt for Solitaire; ink/blue number grid for Sudoku; paired shapes for Pairs; olive letter grid for Word Search; cross/circle for Noughts; numbered tiles for Fifteen; recognisable existing tile faces for Mahjong; approved flag assets for Flags. Shape, title and layout distinguish games without colour alone. |
| Guides discovery | Quiet “A hand getting started” row after the collection with Explore guides. No article cards ahead of gameplay; no empty/nonexistent guide links before M21D publishes content. |

Loading saves must not flash a destructive “New game” or falsely claim Continue. Reserve modest feature space only when appropriate and avoid a large empty skeleton; static and initial hydrated Home contain a deterministic featured Play state. Introduce personal Continue after runtime read, without moving a focused control or changing its destination unexpectedly. A rejected/unavailable save uses existing recovery feedback and honest Play; Flags/Noughts never receive fabricated Continue.

Simple Mode removes decorative preview weight and optional feature duplication, simplifies descriptions and keeps the library and Settings obvious. It does not remove Help, warnings, mode choice or save status. High contrast uses visible borders and labels with no reliance on shadows. Reduced motion has no auto carousel, parallax, animated preview or delayed action. Check text at 200–400% native zoom, forced colours, dark theme and screen-reader headings/link names.

## 5. Guides and editorial architecture

### URL and navigation model

| URL family | Purpose / publication rule |
| --- | --- |
| `/guides/` | Index of actual published articles, grouped by Rules & first steps, Strategy & practice, Choosing a game. Include links by game. No search/filter dependency for basic discovery; native category anchors/links work without JS. |
| `/guides/{game-id}/` | Game shelf only when at least two worthwhile published articles justify it. Otherwise the index links directly to its article; do not emit eight empty/thin hubs. |
| `/guides/{game-id}/how-to-play/` | One definitive expanded teaching article per game/variant when original examples are ready. Game URL remains the Play destination. |
| `/guides/{game-id}/{topic}/` | Specific strategy or accessibility-control walkthrough with a distinct question and worked evidence. No difficulty/region/seed permutations by default. |
| `/guides/choosing/{topic}/` | Comparisons/alternatives that help choose games. Compare implemented ZenPlay features honestly; external competitor claims require dated source verification. No medical/cognitive-benefit promises. |
| `/guides/topics/{category}/` | Optional category landing pages only once there is enough material to browse. These are not required for the first release; index sections suffice initially. |

Breadcrumbs: Home → Guides → [published game shelf, if present] → Article. If no shelf exists, omit that breadcrumb link instead of linking a 404. Game pages keep their compact Games/Home navigation; visible breadcrumbs and `BreadcrumbList` must describe the same hierarchy. Index/article links are ordinary anchors, enhanced through the single app navigation controller when running, with heading focus and scroll handling. Never build a disconnected editorial router.

Article layout: title, one-sentence purpose, author/reviewer and meaningful review date, compact optional contents list, readable 60–70ch text column with approximately 18–20px body and 1.6–1.75 leading. Desktop can have a quiet contents rail; phone uses an in-flow disclosure. Use H2/H3 progression, meaningful table headers, captions and alt text. Steps/examples must remain readable in high contrast and large print. Include a clear Play [game] anchor near the beginning/end and a small related-reading section. No ads, newsletter overlays, sticky conversion banners or sidebars of unrelated game links. Do not inject live game engines into articles.

### Minimal content model and build integration

Use typed TypeScript records and structured React-rendered blocks first, inside a proposed `src/content/guides/` directory. Existing React/Vite rendering handles these without Markdown/MDX, a CMS or another package. Blocks can cover paragraph, heading, ordered steps, lists, existing illustration references and simple example tables. Escape strings through React; no arbitrary raw HTML or imports of browser/runtime/persistence code. Add Markdown only when an actual authoring bottleneck justifies a separately reviewed parser.

Proposed record fields:

```ts
// Design sketch, not an implemented public API.
type Guide = {
  id: string; slug: string; gameIds: GameId[]
  category: 'rules' | 'strategy' | 'choosing'
  status: 'draft' | 'published'
  title: string; description: string; summary: string
  author: string; reviewer: string | null
  publishedAt: string | null; reviewedAt: string | null
  relatedGuideIds: string[]
  blocks: GuideBlock[] // Explicit supported, accessible content blocks.
}
```

Derive canonical paths centrally from IDs/slugs; do not let arbitrary author-entered URLs override the canonical host. Validate slug uniqueness/reserved segments, valid game references, dates, required reviewer/body, supported blocks, related published targets and article-specific intent. Derive all public route enumeration, index links, metadata and sitemap from **published** records. Keep draft bodies out of production HTML, client bundles, sitemap, JSON-LD and precache; `noindex` is not draft access control. Use an explicit reviewed list/import boundary for publishable records so filtering an eagerly bundled draft array does not accidentally ship the drafts. Local draft review can be an opt-in build outside deployable output; no public draft route is required.

Add `guides`, optional `guide-game`/category and `guide-article` navigation variants to the existing typed model; introduce a validated `guideId`/slug field rather than storing articles in `gameId`. Update path round trips, history serialization, legacy handling, canonical alias handling and route tests together. Keep the existing legacy version semantics working; if a new history version is necessary, specify its backwards-compatible reader rather than replacing version 2 blindly.

Split guide metadata/index summaries from article bodies. Avoid importing every article body into the eagerly downloaded public game shell. Static rendering can import all **published** bodies. For direct article entry, the proposed browser entry loads only that published article module before calling `hydrateRoot`, leaving useful static HTML readable while it loads; pass the same article data to PublicShell/Bootstrap so its first render matches. SPA article navigation uses that same per-article loader with an accessible loading state. Do not hydrate a loading placeholder over already-rendered article text. Prove this boundary with one article in M21D before expanding it. A full-document anchor is a valid progressive fallback, but ordinary runtime game→guide links should preserve the existing pending-write protections.

Reuse `renderDocument`, the isolated renderer and `seoPrerender.writeBundle` for published guide/index documents. Finish **all** HTML/discovery files before PWA `closeBundle`; no second post-build HTML writer. Extend `pageRoutes`/route enumeration or a shared public-route descriptor so sitemap, exact redirects, preview 404 handling and Workbox aliases all see the same published route set. Preserve top-level 404 and no catch-all homepage fallback.

### Metadata, structured data and offline policy

- Unique title/description per intent; self-canonical on the existing `https://playadfree.games` origin, slash paths. Query/filter/sort states do not create duplicate indexable URLs. Utilities remain noindex. Preview policy stays fail-closed, independent of canonical URL.
- Published index: `CollectionPage`/`ItemList` referencing real published links. Article: `WebPage` + `Article`, truthful `headline`, description, author/reviewer where supported, real published/modified dates, `isPartOf` and `BreadcrumbList`. Use `dateModified` only for meaningful reviewed changes. Do not invent Person credentials or use an unnamed team as a fictional individual; a real ZenPlay editorial organisation is acceptable.
- Retain existing `VideoGame` on playable routes. Do not put duplicate game entities on every guide or fabricate reviews/ratings/FAQ/HowTo markup for rich results. Schema validity does not promise search features. Use article-specific social type/metadata, reusing the existing brand image until new artwork is approved.
- Sitemap includes only published, canonical, indexable routes. Do not emit every possible category/game shelf. `lastmod`, if introduced, comes from meaningful published revisions, not build time. Draft removal/withdrawal must remove index links and sitemap entries; use a deliberate replacement redirect only for a genuine equivalent, otherwise 404/410 policy, never Home.
- **Preserve Home-only offline readiness for all eight games and existing utilities.** For an initial small text-only guide set, precache published guide HTML, index and required article chunks/local diagrams as final static resources. Report incremental bytes/counts and wait for complete cache readiness. Never cache accounts/APIs/private drafts.
- The present HTML/JS glob would eagerly precache every future guide. Before editorial size materially grows, set an owner-reviewed offline content budget and split optional editorial resources from core game readiness. A future visited-guides cache must use exact published routes, bounded eviction and a truthful offline-unavailable message; index links alone do not mean every guide is saved. No broad HTML/API runtime cache or unapproved custom-worker rewrite in M21D. The initial text-only catalogue should not need a new dependency.

### Ownership and quality workflow

Product owner commissions a specific reader question and assigns one author plus a reviewer familiar with that game's implemented controls. Author drafts examples against the current build; reviewer checks accuracy, accessibility, intent overlap and sources. Publication changes `draft` to `published` only after editorial sign-off and automated build/link/schema checks. Record actual author/reviewer/date in content, with no invented byline. A code change to controls/rules flags the affected game guides for review; review dates are not automatically refreshed by a build. Schedule periodic review through the owner's normal workflow, with immediate correction for factual errors; no automation or CMS is created by this document.

Start with a small set of complete articles, such as an illustrated Klondike rules walkthrough and a Sudoku worked single-candidate example. Do not publish eight templated introductions merely to fill shelves. Comparisons need a real choice framework (for example, matching versus number logic, session length described qualitatively, save support based on code), not eight repeated “best free” pages. Article inventory should record primary intent, canonical destination, owner, status, review date and related Play URL.

## 6. SEO strategy and content separation

M20B.2's **technical foundation is worth retaining**: nine indexable public routes, descriptive identities, useful static content, crawlable anchors, safe JSON-LD, canonical/404 policy, game code splitting, offline pages and same-origin persistence. Its default presentation does not meet the brief's game-first quality: even modest content blocks become intrusive beside short games and narrow boards. Metadata quality and indexability do not require an article permanently surrounding the game.

| Intent | Primary destination | Content boundary |
| --- | --- | --- |
| Play Solitaire/Sudoku/etc. | `/games/{id}/` | Unique title/description/H1, real JS game/loading explanation, native Help with essential rules/controls and truthful limitations. No target word count. |
| Learn rules / learn a technique | `/guides/{game-id}/{topic}/` | Original explanation, worked examples, diagrams when justified, full keyboard/accessibility walkthrough if relevant. Strong Play link. |
| Choose a calm game / compare formats | `/guides/choosing/{topic}/` | Distinct decision criteria and verified features, linking to relevant playable games and deeper guides. |
| Browse games / browse reading | `/` and `/guides/` | Different collection purposes and clear navigation. Library prioritises play; Guides prioritises reading. |

Avoid cannibalisation through editorial intent mapping, not arbitrary keyword quotas. “Free Solitaire, No Adverts — ZenPlay” remains the playable destination; “How to play Klondike Solitaire: a worked first game” is educational. A guide should not be titled like another Play page. Keep shared rule facts concise in game Help; use original examples/explanation in the article. Do not copy the same large rules body onto both. Self-canonical distinct useful pages; do not canonical every guide to the game, which would deny its independent purpose.

Guide → game: one prominent Play link and contextual links where useful. Game → guide: a small published-only selection **inside Help**. Home → all games and Guides; Guides → articles/game shelves; articles → a small set of relevant published articles. Native closed disclosure content remains in the delivered HTML and available to humans and crawlers; this is legitimate on-demand interface content, not crawler-specific hiding. No universal related-games block below every active board. No minimum word-count or hidden-link policy.

Retain one H1/main and accessible headings, canonical origin/path rules, static no-JS rules, safely escaped JSON-LD and no private state in prerender. Replace existing tests that require permanently expanded paragraphs with tests for useful, user-operable disclosure content. Recheck metadata on SPA transitions, direct entry, refresh, history and aliases; do not allow a guide URL to retain the previous game's title/schema.

**M20C-A release findings remain separate blockers**: that pre-existing report records missing production `ZENPLAY_PRODUCTION_BRANCH`, hosted Cloudflare analytics injection, and incomplete physical/two-release acceptance. They were not remotely reverified or changed here. The redesign cannot itself prove the deployed site is tracking-free, indexable or safely upgradable. Do not promote an existing noindex preview artifact to production. No traffic, ranking or search-enhancement improvement is promised.

## 7. Three design directions and review concepts

All three retain readable controls, optional accounts, local saves and ad-free play. They differ in hierarchy as well as palette.

| Dimension | A — Classic Games Lounge | B — Modern Play Studio | C — Editorial Games Library |
| --- | --- | --- | --- |
| Identity | Warm cream, felt green, familiar paper/card motifs, restrained serif brand/headlines. | Clean off-white/slate, deep teal actions, system sans and crisp surfaces. | Paper/ink, muted burgundy/ochre accents, serif masthead and a stronger publishing voice. |
| Home | Small welcome, useful saved/featured game, recognisable compact game collection, quiet reading-room link. | Minimal welcome, slim Continue strip, denser four-column game collection and direct actions. | Games-led masthead and three-column preview shelf, visible editorial introduction and curated reading below. |
| Game page | Compact title and calm felt/paper surfaces; help as an obvious disclosure. | Most restrained chrome and bounded play workspace; no editorial distractions. | Same compact gameplay contract; publishing identity stays in Help/Guides, never around the live board. |
| Guides | Quiet reading room grouped by game and learning need. | Task-oriented reference index, clear headings/steps, little ornament. | Strongest article typography, category shelves, curated related reading and visible editorial responsibility. |
| Type / spacing | 18px body; serif 30–44px home heading; 16–24px spacing; tactile but subtle borders. | 18px system body, 28–40px home heading; 12–24px rhythm; economical use of space. | 18–20px article body; 32–48px masthead/headline; 24–32px section rhythm; 65ch reading width. |
| Accessibility | Familiar recognition helps; serif only in short headings. Must keep motifs contrast-safe and shadows nonessential. | Predictable alignment and fast scan; avoid small labels, anonymous icons or dashboard styling. | Strong reading hierarchy; guard against long copy, oversized headings and editorial chrome overwhelming play. |
| Strengths | Fits current brand and audience; welcoming without clinical styling; reuses present palette and approved art. | Best compact gameplay treatment; straightforward responsive implementation. | Best long-term editorial identity and content ownership cues. |
| Weaknesses | Can become nostalgic decoration or oversized feature panels without strict density review. | Can feel generic/productivity-like; needs recognisable previews and warmth. | Highest risk of returning to “article containing a game”; requires editorial capacity to justify prominence. |
| Complexity | Low–medium: shared shell, cards and tokens; no asset replacement needed. | Low–medium: shell/toolbar/grid changes; board-specific work remains substantial. | Medium: more page templates/content variants; maintaining content is a continuing cost, not just CSS. |

**Recommendation:** A's library/brand with B's gameplay discipline. Borrow C's reading typography and ownership cues only within Guides. Preserve existing light/dark preferences and game assets. This is a deliberate division by user task, not three competing themes to ship as extra settings.

Review artifacts: [concepts.html](M21A_design_review/concepts.html) offers A/B/C Home views, a schematic game layout and guide index. It is **not implemented product UI**. All board/preview graphics are CSS/text placeholders; illustrative Continue is labelled as an example, game buttons are disabled, and card Play links preview the common layout rather than launching actual games. Settings/Profile/Install are review anchors; preference checkboxes only alter the mock document. No production logo or artwork was generated/replaced.

The yellow concept-review banner is review chrome, not a proposed app element. Do not include its height in production fold acceptance. The mock is a visual direction aid, not a completed first-visit/returning-state implementation, live Help integration or mobile Mahjong solution. The schematic game view omits global library utility chrome; production must retain the actual game-specific toolbar/board. M21B's measured game slice, not these placeholder cards, establishes geometry acceptance.

Reproduce from repository root:

```powershell
npm run build
node context/M21A_design_review/audit.mjs
```

The collector starts/closes an ephemeral localhost preview, serves the mock at `/__design-review/` through a **review-only middleware**, writes `results.json` and JPEGs, and closes its disposable headless browser. Set `ZENPLAY_TEST_BROWSER` only if the local Chromium/Edge executable differs. It leaves a unique fixture-only browser profile in OS temp for normal cleanup. A failed run writes a diagnostic checkpoint. `--concepts-only` refreshes the eight concept captures and writes [concept-results.json](M21A_design_review/concept-results.json), including seven-width Lounge geometry, without repeating the game audit. No new package is installed. For interactive review, open `concepts.html` directly in a browser; query parameters `direction=lounge|studio|editorial` and `view=home|game|guides` select the examples. It needs no service, network, account or build and is never copied into `dist`.

Concept captures: [A mobile](M21A_design_review/screenshots/concept-lounge-390.jpg), [A desktop](M21A_design_review/screenshots/concept-lounge-1440.jpg), [B desktop](M21A_design_review/screenshots/concept-studio-1440.jpg), [C desktop](M21A_design_review/screenshots/concept-editorial-1440.jpg), [schematic game](M21A_design_review/screenshots/concept-game-390.jpg), [Guides](M21A_design_review/screenshots/concept-guides-1440.jpg). Mobile B/C are also retained.

## 8. Component and file impact map

Paths below are **proposed future changes**, not files modified by M21A.

| Area / exact files | Reuse / revise / replace |
| --- | --- |
| `src/seo/PublicShell.tsx` | Reuse deterministic shell boundary; revise `PublicGamePage` to compact identity + native Help + game region, replacing permanent intro/rules/related tail. Revise `HomePage` composition. Keep utility/not-found output. |
| `src/components/GameShell.tsx`, `GameToolbar.tsx` | Reuse anchors/one heading/group semantics. Generalise compact header beyond Solitaire; provide shared Help placement without global toolbar rewrites. |
| `src/components/GameDialog.tsx` | Reuse existing game-specific confirmations/options. If modal Help is later adopted, review inert/background handling, focus restoration, scroll/focus visibility and shared IDs. Do not replace every dialog for a visual refresh. |
| `src/components/GameCard.tsx` | Reuse catalogue/anchor/native modified-click behaviour; replace text-only motif presentation with a bounded preview and explicit Play/Continue affordance; retain safe accessible names. Optional small `GamePreview.tsx` is justified only to share preview rendering. |
| `src/app/gameCatalogue.ts`, `gameRegistry.ts` | Keep game IDs, paths, support flags and save loaders. Align visible Mahjong/Flags names with page identity. Optional preview descriptors stay browser-independent. No engine imports for cards. |
| `src/app/App.tsx` | Reuse navigation, error/Suspense boundary, save/update/install warnings and provider. Wire Help without board remount; extend route rendering for guide screens; feature saved-game availability using existing read barriers. |
| `src/app/navigation.ts`, `navigation.test.ts` | Keep path precedence, native anchors, aliases and legacy root compatibility. Extend typed route payload/descriptors for published guides; test guide/article/history identities and fragments. |
| `src/seo/publicContent.ts`, `metadata.ts` | Retain canonical identities/game schema. Refactor stable quick rules for shared Help use; add guide metadata/schema via published records; do not duplicate editorial bodies here. |
| `src/seo/render.tsx`, `Bootstrap.tsx`, `src/main.tsx`, `index.html` | Preserve isolated static render and matching initial markup; extend route rendering/no-JS clarity. Bootstrap is a sensitive boundary, not a redesign target. Change only where proof demands it. |
| `src/styles/tailwind.css` | Revise shell/library/header/card/typography rules and game-specific responsive controls narrowly. Keep approved Solitaire card/drag/artwork rules. Ensure Simple Mode, UI scale, dark/high contrast and reduced-motion overrides cover new surfaces. |
| `src/games/solitaire/ui/SolitaireScreen.tsx` | Connect shared Help; preserve draw-specific text, Appearance/Options, handedness, card/gesture components and queue registration. No artwork/engine changes. |
| `src/games/sudoku/ui/SudokuScreen.tsx`, `pairs/ui/PairsScreen.tsx`, `wordSearch/ui/WordSearchScreen.tsx` | Within `src/games/`, adapt Help/toolbar and bounded responsive layout while preserving number pad/notes/keyboard, reveal timing/card semantics and word-list/endpoint interactions respectively. |
| `src/games/noughtsCrosses/ui/NoughtsCrossesScreen.tsx`, `fifteen/ui/FifteenScreen.tsx` | Preserve mode/difficulty/round protection and tile focus/confirmation; compact repeated hints/chrome, connect Help. |
| `src/games/mahjong/ui/MahjongScreen.tsx`, `MahjongTileFace.tsx`, relevant CSS | Add Help, investigate larger readable tile viewport using current layout coordinates and controls. Face/engine rewrite is excluded; stop for owner review if comfortable play requires a larger intervention. |
| `src/games/flags/ui/FlagsScreen.tsx` | Add Help access and narrow layout improvements. Preserve setup, feedback/learning hook, keyboard focus and mode-specific session semantics. |
| Proposed `src/content/guides/`, `src/seo/GuidePages.tsx` | New only in M21D: typed published content/index and pure page views. Keep body imports out of eager game shell where possible; do not add a parallel framework. |
| `src/seo/discovery.ts`, `scripts/seoPrerender.ts`, `vite.config.ts` | Extend route-driven sitemap/exact aliases/prerender/precache for actual published guides. Preserve final-HTML-before-Workbox ordering and existing root PWA identity. |
| `src/seo/render.test.ts`, `discovery.test.ts`, `scripts/seoCases.mjs`, `verify-seo-build.mjs`, `verify-seo-browser.mjs` | Repair equivalence matrix; extend expected routes/static Help/published-only links, browser save/history/Help/guide transitions and offline assertions. Replace assertions that encode expanded SEO copy, retaining useful-content checks. |
| `src/app/AccessibilityProvider.tsx`, `src/lib/settings.ts`, `src/persistence/*`, all game `save.ts` / model files | **Preserve contracts**, not refactor targets. Database `zenplay-local` version 1, schema-1 saves/stats, existing game IDs, settings version 5 and profile/session keys stay unchanged. Reuse queued-write barrier. |

Existing account/support/payment code, external services, public card/flag assets and lockfile are outside the redesign scope. A feature does not justify broad cleanup of `App.tsx` or a game engine.

## 9. Phased implementation roadmap

Every phase is a separately scoped implementation after owner approval. Do not combine M21B–F into this audit. Use existing tooling and proportional tests, preserve unrelated work, and stop rather than expanding into a new platform.

### M21B — Game-first experience

- **Scope:** one Solitaire + one non-Solitaire slice to prove shared compact header/native Help/no-JS equivalence, then extend to all eight games. Remove permanent SEO intro/tail. Retain dynamic controls/instructions. Include Mahjong mobile sizing feasibility; toolbar-only improvement is insufficient to declare mobile acceptance.
- **Files:** PublicShell, GameShell/Toolbar, shared rules, narrowly affected screen UI/CSS, App wiring, no-JS message and existing SEO/browser tests. Repair the faulty route-equivalence test first. Do not touch engines, save formats or asset art.
- **Acceptance:** one H1/main, explicit Games link, no expanded editorial regions by default; useful operable Help without JS; same rules/identity across initial/hydrated UI; Help does not remount/redeal/lose focus. Essential controls and warnings remain. Compare first playable content against this audit at every width; establish comfortable reachable Mahjong targets or explicitly block its mobile sign-off.
- **Automated:** targeted navigation/render/settings/pending-write/game-UI-source tests, build + `verify:seo`, existing browser suite adapted for Help. Assert each route's intended identity in equivalence tests. Browser tests open static Help before slow hydration; test Enter/Space, Tab/Shift+Tab where modal, Escape where supported, focus return, fragments, real moves and rapid Home/Continue for six schema-1 fixtures. Assert final HTML revision hashes and no runtime/hydration warnings.
- **Browser/device:** all eight at seven widths, default/light/dark, individual and combined large UI/pieces/high contrast/Simple Mode/reduced motion; cold/slow load and CSS zoom/native 200–400%; physical Android tap/drag/rotation, iOS Safari, keyboard and representative NVDA/VoiceOver/TalkBack Help/board checks.
- **Risks:** duplicated/omitted dynamic rules, menu focus loss, disclosure reset at runtime handoff, hidden board overflow, save queue timing, oversized or illegible boards. **Stop** on any save loss, hydration mismatch, missing essential control or inaccessible Help; escalate larger Mahjong interaction design instead of quietly shrinking tiles or rewriting the engine. Exit to M21C only with a reviewed eight-game surface or clearly blocked acceptance decision.

### M21C — Homepage redesign

- **Scope:** implement approved A/B hybrid, compact utilities, previews, responsive grid and honest first-visit/returning feature states. Include no-save, loading, valid-save, rejected-save, storage-unavailable and installed/uninstalled cases. No new editorial links until targets exist.
- **Files:** HomePage, GameCard, optional presentational preview component/catalogue descriptors, CSS and narrow App save-feature wiring. Reuse current install/profile/settings routes and loaders; no new history-tracking store or save migration.
- **Acceptance:** recognisable eight-game collection, explicit Play/Continue names, one useful action visible at 320×568, desktop space used effectively, six-game save scope truthful. No card anchor nesting/duplicate action stops; no new-game destruction on a library click. Focused links do not move when availability settles. Large print/Simple Mode reduce column count as necessary.
- **Automated:** targeted catalogue/availability and anchor tests; Home static/runtime checks, native modified clicks, six save fixtures, private-state exclusion, installed-state behaviour, console/layout smoke. Build + SEO verifier confirm Home canonical/schema and all eight links; core save/history suite where wiring changes.
- **Browser/device:** seven widths including breakpoint edges; first/no-save and seeded returning users; offline library/Continue, native keyboard/zoom, dark/high contrast and preference combinations. Older-player read/recognition and physical touch review for preview/action size.
- **Risks:** extra asset/engine loading per preview, action-label changes during focus, false recent/resume claims, giant hero displacing games. **Stop** if library actions fall below the fold on smallest default viewport, card text clips, save/session identity changes, controls lose settings visibility or unapproved artwork/dependencies become necessary. Owner reviews actual responsive Home before M21D expansion.

### M21D — Guide architecture

- **Scope:** published-only typed content model, Guides index and one complete article to prove static route + browser navigation + metadata + offline. Game/category shelves only when populated. Local drafts remain outside production artifacts.
- **Files:** proposed content and GuidePages, navigation/App/PublicShell/render, metadata/discovery, prerender and Vite PWA route lists; targeted render/discovery/navigation/build/browser tests. Keep route definitions/data browser-independent.
- **Acceptance:** direct HTTP/JS-disabled reading, one H1/main, working breadcrumbs/Play link, self-canonical/Article metadata, true 404 for unknown/draft slugs, published-only sitemap/index/bundle/precache. Final docs precede SW hashing. No game entrypoint eagerly downloads every article body; measure emitted chunks and precache bytes.
- **Automated:** content validator (unique paths, valid published references, reviewer/dates/body/intent), route round trips/aliases, guide→game/game→guide/back/refresh metadata, genuine 404s, HTML/static-first-render equivalence, no draft text in `dist`, final hash checks and core offline coverage. Existing build and SEO/browser verifier extended with explicit guide cases; no wildcard URL expectations.
- **Browser/device:** seven-width index/article reflow, no-JS native contents/breadcrumbs, large print/dark/high contrast, direct offline entry after Home readiness, return to known saved positions; unsaved-session warning clarity for Flags/Noughts.
- **Risks:** route collisions, guide data creeping into gameId, giant eager bundle/precache, stale article canonicals, private drafts shipped via imports. **Stop** on draft exposure, route/HTML/worker divergence, loss of core offline readiness, missing original article or any need for an unapproved CMS/SSR/framework change. Publish nothing merely to complete a URL grid.

### M21E — Content and internal linking

- **Scope:** owner-approved small editorial batch, game Help → relevant guides, article → Play and related-reading links; then worthwhile shelves/categories. Track primary intent and maintain actual author/reviewer ownership.
- **Files:** published guide records/blocks, stable quick rules, index/link descriptors and content validation cases. Update existing inaccurate documentation only as necessary; do not generate a separate content system for every game.
- **Acceptance:** each article answers a distinct question with original useful examples and correct implemented controls/variants; no copied rules essays across Play/guide URLs, thin comparison templates, unverified competitor/health claims or draft/dead links. All visible breadcrumb/schema/metadata identities agree. Reading links consume no permanent gameplay space.
- **Automated:** published-link/slug/duplicate-intent checks, renderer/metadata/schema parsing, sitemap/lastmod rules, build/SEO verifier, final revisions and incremental offline-byte report. Browser smoke for affected links/content; rerun save tests only where navigation wiring changed.
- **Browser/device:** proofread on phone/tablet/desktop; keyboard/screen reader checks of example tables/figures and Play return; spot-check actual game examples; verify offline article assets and enlarged text.
- **Risks:** cannibalisation through duplicated intent, inaccurate mode/save statements, unsustainable review workload and editorial payload growth. **Stop** if review ownership is missing, original value cannot be demonstrated, factual sources are inadequate or offline scope exceeds the agreed budget. Keep the batch small instead of publishing placeholders.

### M21F — Acceptance, not automatic release

- **Scope:** final local regression/UX audit against this baseline, owner device/accessibility acceptance, and an explicit release handoff. Preserve M20C-A hosted blockers and approval boundaries. No production release is implied by passing local checks.
- **Files:** existing scripts/tests and an evidence section in the milestone/acceptance record; targeted defect fixes only. No engine refactor, save migration, dependency refresh or payment/analytics changes as acceptance cleanup.
- **Acceptance:** eight playable routes + Home + published Guides + utilities/404 behave correctly with JS/no-JS; no permanent editorial intrusion; keyboard, focus, meaningful help, touch/zoom and visual controls pass. All six saves, sessions, statistics, profile and accessibility preferences survive navigation/offline/updates. Performance evidence separates startup JS, board readiness and background offline downloads; investigate material regressions against the same-device setup rather than claiming speed from file sizes.
- **Automated:** `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run verify:seo`, `npm run test:seo-browser`, targeted redesign collector, final artifact/draft/link/hash checks. Run broader suite once final code is stable; repeat only for subsequent relevant fixes/failures. Console, hydration, unknown-route and storage/error cases included.
- **Browser/device:** seven widths and breakpoint edges, actual 200/400% zoom, full keyboard traversal, older-adult legibility/touch review, physical Android Chrome and iOS Safari/standalone, NVDA/VoiceOver/TalkBack samples, rotation/safe areas/suspension, storage unavailable/eviction, Home-only offline readiness for all games and promised guides. Test real Solitaire long stacks/drag/Undo and Word Search scroll/tap alternatives.
- **PWA upgrade:** separately authorised test on **one stable nonproduction origin**, release A→B with genuinely different assets. Active game tab must stay usable while another Home tab accepts an update; exercise old lazy imports after B activation/old-cache cleanup, Later, offline restart and retained saves. Same-assets worker-comment fixtures do not satisfy this gate. Never wipe real caches/storage or force reload to make the test pass.
- **Risks / stop:** any lost save, inaccessible essential game interaction, mismatched HTML/hydration/metadata, accidental draft indexing, stale Workbox revisions or mid-game reload is a no-go. Unresolved hosted analytics/indexing or two-release/device acceptance blocks production sign-off. End with owner review and separately authorised release actions; no merge/push/deploy under M21A or automatic M21F completion.

## 10. Risks and owner decisions

| Decision / risk | Recommended default / remaining owner action |
| --- | --- |
| Visual direction | Approve A's warmth plus B's game-first layout; use C only for reading. Mockups are concepts, not production asset approval. |
| Help behaviour | Approve native disclosure as the accessible baseline. Modal enhancement is optional after actual focus/handoff proof. Keep dynamic controls and no-JS rules. |
| Mahjong phone usability | Approve a narrow larger-board viewport experiment with current engine/art. Require real-device comfort; decide whether further interaction work is needed if panning/zoom does not suffice. Do not call existing 14–20px tiles accepted. |
| Homepage feature | Prefer newest valid resumable save, labelled honestly; deterministic featured Play fallback. Confirm whether a favourite should outrank recency later. Never claim recent Flags/Noughts progress is resumable. |
| Editorial capacity | Assign real content owner/reviewer and first original articles before publishing. No obligation to fill eight game shelves at launch. |
| Offline editorial growth | Initial complete text-only set may join precache; agree a measured byte/count budget and explicit policy before wider image/article growth. Core all-eight-game offline promise is fixed. |
| Canonical game names | Use Mahjong Solitaire and Flags Quiz consistently in library, Help and metadata; preserve existing IDs/save paths. Owner reviews naming, not a route migration. |
| Theme/assets | Preserve current preferences/default theme. No new logo, production imagery or artwork replacement without approval. Existing contrast/familiarity take priority over decoration. |
| Release blockers inherited from M20C-A | Owner resolves production branch/indexing configuration and existing hosted analytics injection separately; physical acceptance and different-assets stable-origin upgrade remain required. No hosted changes or analytics decision executed here. |

These decisions do not authorise M21B. **Stop here for owner review of the recommendation, audit and concepts.**

## 11. Verification in this pass

| Check | Result |
| --- | --- |
| `npm run build` | Passed, including project-reference TypeScript and isolated renderer/client build. Existing Browserslist-age advisory only; no update made. |
| `npm run verify:seo` | Passed: 13 distinct canonical documents, aliases/404/discovery, final HTML revisions, root PWA identity and eight lazy game assets. 250 precache entries / 5,538,404 unique bytes; not device transfer/storage measurement. |
| Review collector | Passed: 88 measured layouts, six Enter/Escape focus checks, nine no-JS document checks, 111 screenshots, no captured runtime errors or console warnings. |
| Script syntax / concept verification | `node --check` plus inline-script syntax and artifact/link/geometry checks recorded during final review. Concepts render in the same disposable browser. |
| Production tests | No production source changed; full unit/device/offline lifecycle suites were not newly rerun or certified. Existing M20 results remain historical evidence, not new M21 test claims. |
| Git/document checks | Final whitespace, local-link/artifact and scope checks performed before delivery. Only this report/review directory were added; pre-existing preflight preserved. |

No deployment, external account operation, payment/analytics change or asset replacement is part of this work.
